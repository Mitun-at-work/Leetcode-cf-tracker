cmake_minimum_required(VERSION 3.10)
project(cpp-executor)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find required packages
find_package(Threads REQUIRED)

# Include directories
include_directories(include)

# Add executable
add_executable(cpp-executor main.cpp)

# Link libraries
target_link_libraries(cpp-executor Threads::Threads)

# Compiler flags
target_compile_options(cpp-executor PRIVATE -Wall -Wextra -O2)