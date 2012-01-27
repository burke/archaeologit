require 'open3'
require 'yaml'
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

    def log_stuff(ref, file)
      FileUtils.cd(path) do
        p3 = Open3.popen3("git", "log", "--reverse", "-p", ref, file)
        return p3[1].readlines.join("\n")
      end
    end

    def path
      REPO_DIR + @repo
    end

  end
end

