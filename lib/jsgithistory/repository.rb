require 'yaml'

module JSGitHistory
  class Repository
    def self.histories
      @histories
    end

    REPO_DIR = "/Users/burke/jsgh_repos"
    
    def local_copy_exists?
      File.directory?(local_path)
    end 
    
    def clone
      system("git", "clone", github_url, local_path)
    end 
    
    def initialize(user, repo)
      @user = user
      @repo = repo
      clone unless local_copy_exists?
    end 

    def local_path
      "#{REPO_DIR}/#{@user}/#{@repo}"
    end 
    
    def github_url
      "http://github.com/#{@user}/#{@repo}.git"
    end 
    
    def path
      "#{REPO_DIR}/#{@user}/#{@repo}"
    end 
    
  end
end 

