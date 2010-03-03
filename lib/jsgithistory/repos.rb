require 'yaml'
module JSGitHistory
  class Repos
    USER_DIR = Pathname.new(File.expand_path('~/.jsgithistory/')) 

    def self.all
      # might be an idea to not cache this...
      @all ||= YAML.load_file(user_config_repos_path || app_config_repos_path)
    end

    private

    def self.user_config_repos_path
      path = USER_DIR + 'repositories.yml'
      path if File.exists?(path)
    end

    def self.app_config_repos_path
      App.root + 'repositories.yml'
    end

  end
end
