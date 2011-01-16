require 'yaml'
require 'fileutils'

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

    def pull
      FileUtils.cd(local_path) do
        system("git", "pull")
      end       
    end 
    
    def initialize(user, repo)
      @user = user
      @repo = repo
      local_copy_exists? ? pull : clone
    end 

    def local_path
      "#{REPO_DIR}/#{@user}/#{@repo}"
    end 
    
    def github_url
      "http://github.com/#{@user}/#{@repo}.git"
    end 

    # attempt to prevent traversal
    def no_traverse(path)
      return '/' unless path and path.first
   
      path = path.first
      safe_depth =      path.scan(/\/[\w_]/).length
      attempted_depth = path.scan(/\.\.\//).length
   
      safe_depth >= attempted_depth ? path : '/'
    end
    
    def path
      "#{REPO_DIR}/#{@user}/#{@repo}"
    end 
    
  end
end 

