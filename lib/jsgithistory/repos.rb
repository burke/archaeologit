require 'yaml'
require File.join(File.dirname(__FILE__),'repohistory')

module JSGitHistory
  class Repos
    USER_DIR = Pathname.new(File.expand_path('~/.jsgithistory/')) 

    def self.histories
      @histories
    end
    
    def self.all
      @all ||= YAML.load_file(user_config_repos_path || shared_config_repos_path || app_config_repos_path)
      @histories ||= @all.inject({}){|a,(k,v)| a[k] = RepoHistory.new(v).commits_json; a}
      @all
    end

    private

    def self.user_config_repos_path
      path = USER_DIR + 'repositories.yml'
      path if File.exists?(path)
    end

    def self.shared_config_repos_path
      path = App.root + '../../shared/repositories.yml'
      path if File.exists?(path)
    end

    def self.app_config_repos_path
      App.root + 'repositories.yml'
    end

  end
end
