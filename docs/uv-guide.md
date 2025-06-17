<?xml version="1.0" encoding="UTF-8"?>
<uvProjectManagementUpdate>
    <metadata>
        <title>Project Management with UV from Astral for Python (Windows/MacOS)</title>
        <version>1.0</version>
        <lastUpdated>2025-05-07</lastUpdated>
        <description>An update document for managing Python projects using UV from Astral, focusing on Windows and MacOS.</description>
    </metadata>

    <introduction>
        <whatIsUV>
            UV is an extremely fast Python package installer and project manager, comprehensive tool that can replace `pip`, `pip-tools`, `virtualenv`, `venv`, `pipx`, and potentially aspects of `pyenv` and `poetry`.
        </whatIsUV>
    </introduction>

    <installation>
        <note>UV itself does not depend on Python for its own execution but requires a Python environment to install packages and manage projects.</note>
        <os name="Windows">
            <method type="PowerShell (Recommended)">
                <command>powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"</command>
                <description>Installs UV using the official PowerShell script. Administrator privileges may be required.</description>
        </os>
        <os name="MacOS">
            <method type="Homebrew">
                <command>brew install uv</command>
                <description>Install UV using Homebrew package manager. [1, 7, 9]</description>
            </method>
        </os>
        <verification>
            <command>uv --version</command>
            <description>After installation, run this command to verify that UV is installed correctly and to check its version.</description>
        </verification>
        <upgrading>
            <command>uv self update</command>
            <description>Updates UV to the latest version if installed via the standalone installer. [6]</description>
        </upgrading>
    </installation>

    <coreFeaturesAndCommands>
        <feature name="Project Initialization">
            <command>uv init [PROJECT_NAME]</command>
            <description>Initializes a new Python project. Creates `pyproject.toml`, a `.python-version` file, `README.md`, and a sample `main.py` (often in a `src` directory). If no project name is given, it initializes in the current directory. [4]</description>
            <filesGenerated>
                <file_>`pyproject.toml`: For project metadata and dependencies.</file_>
                <file_>`.python-version`: Specifies the Python version for the project.</file_>
                <file_>`README.md`: Basic README file. [4, 8]</file_>
                <file_>(Optional) `src/main.py` or `main.py`: Sample Python file.</file_>
                <file_>(Optional) `.git` and `.gitignore`: Initializes a git repository.</file_>
            </filesGenerated>
        </feature>

        <feature name="Virtual Environment Management">
            <command>uv venv [NAME] [--python VERSION]</command>
            <description>Creates a Python virtual environment. Defaults to `.venv` if no name is provided. [1, 6, 14, 18] Can specify a Python version (e.g., `3.11` or `path/to/python`). [2, 18, 23] If a virtual environment named `.venv` exists, running `uv venv` again might activate it. [17]</description>
            <activation>
                <platform_specific os="Windows (PowerShell)">
                    <command>.venv\Scripts\activate.ps1</command>
                </platform_specific>
                <platform_specific os="Windows (CMD)">
                    <command>.venv\Scripts\activate.bat</command>
                </platform_specific>
                <platform_specific os="MacOS/Linux (Bash/Zsh)">
                    <command>source .venv/bin/activate</command>
                </platform_specific>
                <platform_specific os="MacOS/Linux (Fish)">
                    <command>source .venv/bin/activate.fish</command> [22]
                </platform_specific>
                 <note>UV automatically creates/manages a `.venv` if one doesn't exist when commands like `uv add` or `uv run` are used within a project.</note>
            </activation>
        </feature>

        <feature name="Dependency Management (Project Context - using pyproject.toml and uv.lock)">
            <subFeature name="Adding Dependencies">
                <command>uv add <package_name> [--dev]</command>
                <description>Adds a package as a project dependency to `pyproject.toml` and installs it. Updates `uv.lock`. [1, 2, 4, 6, 16] Use `--dev` for development dependencies. [16]</description>
            </subFeature>
            <subFeature name="Removing Dependencies">
                <command>uv remove <package_name> [--dev]</command>
                <description>Removes a package from `pyproject.toml` and the environment. Updates `uv.lock`. [4, 6, 19]</description>
            </subFeature>
            <subFeature name="Locking Dependencies">
                <command>uv lock</command>
                <description>Creates or updates the `uv.lock` file based on `pyproject.toml` without modifying the environment. [2, 4, 6] The `uv.lock` file ensures reproducible builds across different environments and should be committed to version control. [4, 16]</description>
            </subFeature>
            <subFeature name="Syncing Environment">
                <command>uv sync [--all-extras] [--dev]</command>
                <description>Installs dependencies specified in `uv.lock` into the virtual environment, ensuring it matches the lockfile. [1, 2, 4, 6, 8, 19] If `uv.lock` is missing or outdated with respect to `pyproject.toml`, `uv sync` may also update the lockfile and then sync. `uv run` also performs this check. [4]</description>
            </subFeature>
            <subFeature name="Exporting Lockfile">
                <command>uv export</command>
                <description>Exports the project's lockfile to an alternate format, like `requirements.txt`. [6]</description>
            </subFeature>
        </feature>

        <feature name="Package Installation (pip-compatible interface)">
            <note>These commands are generally for one-off installations or working with `requirements.txt` files, similar to `pip`. For project-based workflows, `uv add` and `uv sync` are preferred as they manage `pyproject.toml` and `uv.lock`. [16]</note>
            <command>uv pip install <package_name></command>
            <description>Installs one or more packages. [1, 6, 9, 10, 11, 18]</description>
            <command>uv pip install -e .</command>
            <description>Installs the current project in editable mode. [1, 10, 11]</description>
            <command>uv pip uninstall <package_name></command>
            <description>Uninstalls one or more packages. [6]</description>
            <command>uv pip list</command>
            <description>Lists installed packages. [6]</description>
            <command>uv pip freeze</command>
            <description>Outputs installed packages in requirements format. [6, 19]</description>
            <command>uv pip compile <input_file> -o <output_file></command>
            <description>Resolves dependencies from an input file (e.g., `pyproject.toml` or `requirements.in`) and writes the pinned versions to an output file (e.g., `requirements.txt`). [2, 6, 22]</description>
            <command>uv pip sync <requirements_file></command>
            <description>Synchronizes the environment with a requirements file (e.g., `requirements.txt` generated by `uv pip compile`). Installs missing packages and removes unneeded ones. [2, 6, 22]</description>
        </feature>

        <feature name="Running Commands and Scripts">
            <command>uv run <script_or_command></command>
            <description>Runs a Python script or any command within the project's managed environment. [1, 4, 6, 16, 20, 21] Ensures dependencies are synced before execution. [4] Can run `.py` files directly. [6]</description>
            <command>uv run --python <version_or_path> -- <command></command>
            <description>Runs a command using a specific Python interpreter. [2, 6, 12]</description>
        </feature>

        <feature name="Tool Management (like pipx)">
            <command>uv tool install <package_name></command>
            <description>Installs a Python CLI tool in an isolated environment, making its executables available globally (similar to `pipx install`). [5, 6, 23]</description>
            <command>uv tool run <tool_command> [args...] (or uvx <tool_command> [args...])</command>
            <description>Runs a tool in an ephemeral, isolated environment without permanently installing it. `uvx` is a shortcut for `uv tool run`. [2, 5, 6, 21, 23]</description>
            <command>uv tool list</command>
            <description>Lists tools installed with `uv tool install`. [6]</description>
            <command>uv tool uninstall <package_name></command>
            <description>Uninstalls a tool previously installed with `uv tool install`. [6]</description>
        </feature>

        <feature name="Building and Publishing (Basic Support)">
            <command>uv build</command>
            <description>Builds Python packages into source distributions (sdist) and wheels (whl). [6, 16]</description>
            <command>uv publish <path_to_dist></command>
            <description>Uploads distributions to a package index (e.g., PyPI). [6, 16]</description>
        </feature>

        <feature name="Cache Management">
            <command>uv cache clean</command>
            <description>Clears UV's cache. [6, 7, 28]</description>
            <command>uv cache dir</command>
            <description>Shows the location of UV's cache directory. [6, 27]</description>
            <command>uv cache prune</command>
            <description>Removes unused packages from the cache. [6]</description>
            <note>The cache is typically located at `~/.cache/uv` on Linux/macOS and `%LOCALAPPDATA%\uv\cache` on Windows. [6, 27]</note>
        </feature>
    </coreFeaturesAndCommands>

    <projectWorkflowExample>
        <step id="1" title="Initialize a New Project">
            <command>uv init my_ai_project</command>
            <command>cd my_ai_project</command>
            <description>Creates a new project directory and basic project files including `pyproject.toml`. [4, 8]</description>
        </step>
        <step id="2" title="Create and Activate Virtual Environment (Optional - UV can auto-create)">
            <command>uv venv</command>
            <description>Creates a virtual environment named `.venv`. [14]</description>
            <activation_note>Activate it using platform-specific commands (e.g., `source .venv/bin/activate` on macOS/Linux or `.venv\Scripts\activate.ps1` on Windows PowerShell). [11, 14, 18]</activation_note>
        </step>
        <step id="3" title="Define Python Version (Optional)">
            <description>Edit `.python-version` or `pyproject.toml` (`project.requires-python = ">=3.9"`) to specify the Python version. [4, 12] Or use `uv python pin 3.9`.</description>
        </step>
        <step id="4" title="Add Dependencies">
            <command>uv add numpy pandas</command>
            <command>uv add pytest --dev</command>
            <description>Adds runtime (`numpy`, `pandas`) and development (`pytest`) dependencies. This updates `pyproject.toml` and `uv.lock`, and installs the packages. [1, 16]</description>
        </step>
        <step id="5" title="Develop Your Application">
            <description>Write your Python code (e.g., in `src/my_ai_project/main.py` or `my_ai_project/main.py`).</description>
        </step>
        <step id="6" title="Run Your Application/Scripts">
            <command>uv run python src/my_ai_project/main.py</command>
            <description>Runs your main script using the managed environment. [4, 16]</description>
        </step>
        <step id="7" title="Run Tests">
            <command>uv run pytest</command>
            <description>Runs tests using `pytest` from the managed environment. [21]</description>
         <step id="9" title="Ensuring a Clean Environment (Syncing)">
            <command>uv sync</command>
            <description>Ensures your virtual environment exactly matches the `uv.lock` file. [2, 4]</description>
        </step>
        <step id="10" title="Collaborating with Others">
            <description>Commit `pyproject.toml` and `uv.lock` to your version control system. Other developers can clone the repository, run `uv sync`, and have an identical environment. [4, 16]</description>
        </step>
    </projectWorkflowExample>

    <advancedTopics>
        <topic name="Workspace Support">
            <description>UV supports Cargo-style workspaces for managing multiple related Python projects within a single repository. This is an advanced feature for larger projects. [2]</description>
        </topic>
        <topic name="Configuration via pyproject.toml">
            <description>UV can be configured via the `[tool.uv]` section in `pyproject.toml`. [4]</description>
        </topic>
    </advancedTopics>
    <versionInfo>
        <uvVersionMentionedInSources>Examples show versions like 0.4.25 (Oct 2024), 0.6.12 (Apr 2025). [1, 16] Check `uv --version` for your installed version or GitHub for latest releases. [3]</uvVersionMentionedInSources>
        <lastCheckedDate>2025-05-07</lastCheckedDate>
        <dataSource>Based on publicly available documentation and articles, including Astral's official documentation, GitHub, and community tutorials. [1-28]</dataSource>
    </versionInfo>
</uvProjectManagementUpdate>
