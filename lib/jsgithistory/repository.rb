require 'open3'
require 'fileutils'

module JSGitHistory
  class Repository
    REPO_DIR = Pathname.new("/Users/burke/jsgh_repos")

    def initialize(repo)
      @repo = repo
    end

    def pull
      FileUtils.cd(path) do
        system("git", "pull")
      end
    end

    def reconstruction(ref, file)
      FileUtils.cd(path) do
        return Open3.
          popen3("git", "log", "--reverse", "-p", ref, file).
          slice(1).
          readlines.
          join("\n")
      end
    end

    def path
      REPO_DIR + @repo
    end

  end
end

