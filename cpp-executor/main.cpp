#include <crow.h>
#include <iostream>
#include <fstream>
#include <string>
#include <cstdlib>
#include <cstdio>
#include <memory>
#include <stdexcept>
#include <array>
#include <unistd.h>
#include <sys/wait.h>
#include <sys/types.h>
#include <signal.h>
#include <fcntl.h>
#include <chrono>
#include <thread>

std::string exec_command(const std::string &cmd, int timeout_seconds = 10)
{
    int pipefd[2];
    if (pipe(pipefd) == -1)
    {
        return "Error: Failed to create pipe";
    }

    pid_t pid = fork();
    if (pid == -1)
    {
        close(pipefd[0]);
        close(pipefd[1]);
        return "Error: Failed to fork";
    }

    if (pid == 0)
    {                     // Child process
        close(pipefd[0]); // Close read end
        dup2(pipefd[1], STDOUT_FILENO);
        dup2(pipefd[1], STDERR_FILENO);
        close(pipefd[1]);

        // Execute command
        execl("/bin/sh", "sh", "-c", cmd.c_str(), nullptr);
        _exit(1); // If execl fails
    }
    else
    {                     // Parent process
        close(pipefd[1]); // Close write end

        std::string output;
        char buffer[4096];
        ssize_t bytes_read;

        // Set up timeout
        auto start_time = std::chrono::steady_clock::now();

        while ((bytes_read = read(pipefd[0], buffer, sizeof(buffer) - 1)) > 0)
        {
            buffer[bytes_read] = '\0';
            output += buffer;

            // Check timeout
            auto current_time = std::chrono::steady_clock::now();
            auto elapsed = std::chrono::duration_cast<std::chrono::seconds>(current_time - start_time);
            if (elapsed.count() > timeout_seconds)
            {
                kill(pid, SIGKILL);
                close(pipefd[0]);
                waitpid(pid, nullptr, 0);
                return "Error: Execution timed out";
            }
        }

        close(pipefd[0]);

        int status;
        if (waitpid(pid, &status, 0) == -1)
        {
            return "Error: Failed to wait for process";
        }

        if (WIFEXITED(status))
        {
            int exit_code = WEXITSTATUS(status);
            if (exit_code != 0)
            {
                return "Error: Process exited with code " + std::to_string(exit_code) + "\n" + output;
            }
        }
        else if (WIFSIGNALED(status))
        {
            int signal_num = WTERMSIG(status);
            return "Error: Process terminated by signal " + std::to_string(signal_num) + "\n" + output;
        }

        return output;
    }
}

std::string compile_and_run_cpp(const std::string &code, const std::string &input = "")
{
    // Create temporary files
    char temp_dir[] = "/tmp/cpp_exec_XXXXXX";
    if (mkdtemp(temp_dir) == nullptr)
    {
        return "Error: Failed to create temporary directory";
    }

    std::string source_file = std::string(temp_dir) + "/main.cpp";
    std::string executable_file = std::string(temp_dir) + "/main";

    // Write code to file
    std::ofstream source(source_file);
    if (!source)
    {
        return "Error: Failed to create source file";
    }
    source << code;
    source.close();

    // Compile
    std::string compile_cmd = "g++ -std=c++17 -O2 -Wall -Wextra -o " + executable_file + " " + source_file + " 2>&1";
    std::string compile_output = exec_command(compile_cmd, 30); // 30 second timeout for compilation

    if (compile_output.find("Error:") == 0)
    {
        // Cleanup
        unlink(source_file.c_str());
        rmdir(temp_dir);
        return compile_output;
    }

    // Check if compilation succeeded (executable exists)
    if (access(executable_file.c_str(), F_OK) != 0)
    {
        // Cleanup
        unlink(source_file.c_str());
        rmdir(temp_dir);
        return "Compilation failed:\n" + compile_output;
    }

    // Run the executable with input
    std::string run_output;
    if (!input.empty())
    {
        // Create input file
        std::string input_file = std::string(temp_dir) + "/input.txt";
        std::ofstream input_stream(input_file);
        if (input_stream)
        {
            input_stream << input;
            input_stream.close();

            // Check if file was created
            std::ifstream check_file(input_file);
            if (check_file.good())
            {
                check_file.close();
                // Run with input redirection
                std::string run_cmd = "cd " + std::string(temp_dir) + " && ./" + std::string(basename(executable_file.c_str())) + " < input.txt";
                run_output = exec_command(run_cmd, 10);
            }
            else
            {
                run_output = "Error: Failed to verify input file creation";
            }

            // Cleanup input file
            unlink(input_file.c_str());
        }
        else
        {
            run_output = "Error: Failed to create input file";
        }
    }
    else
    {
        // Run without input
        std::string run_cmd = "cd " + std::string(temp_dir) + " && ./" + std::string(basename(executable_file.c_str()));
        run_output = exec_command(run_cmd, 10);
    }

    // Cleanup
    unlink(source_file.c_str());
    unlink(executable_file.c_str());
    rmdir(temp_dir);

    if (run_output.find("Error:") == 0)
    {
        return run_output;
    }

    return run_output;
}

int main()
{
    crow::SimpleApp app;

    CROW_ROUTE(app, "/health").methods("GET"_method)([]()
                                                     { return crow::response(200, "OK"); });

    CROW_ROUTE(app, "/execute").methods("POST"_method)([](const crow::request &req)
                                                       {
        auto body = crow::json::load(req.body);
        if (!body) {
            return crow::response(400, "Invalid JSON");
        }

        if (!body.has("code")) {
            return crow::response(400, "Missing 'code' field");
        }

        std::string code = body["code"].s();
        std::string input = body.has("input") ? std::string(body["input"].s()) : std::string("");
        std::string result = compile_and_run_cpp(code, input);

        crow::json::wvalue response;
        response["output"] = result;
        response["success"] = (result.find("Error:") != 0);

        return crow::response(200, response); });

    app.port(8081).multithreaded().run();
}