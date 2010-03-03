require 'yaml'
module JSGitHistory
  class Repos
    USER_DIR = Pathname.new(File.expand_path('~/.jsgithistory/')) 

    def self.all
      # might be an idea to not cache this...
      @all ||= YAML.load_file(path_user_dir_repo || load_from_config_dir)
    end

    private

    def self.path_user_dir_repo
      path = USER_DIR + 'repositories.yml'
      path if File.exists?(path)
    end

    def self.load_from_config_dir
      App.root + 'repositories.yml'
    end

  end
end
