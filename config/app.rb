require 'pathname'
module JSGitHistory
  class App
    def self.initialize!
      @root = Pathname.new(File.expand_path('../../',__FILE__))
    end
    def self.root
      @root
    end
    def self.public_path
      @root + 'public'
    end
    def self.view_path
      @root + 'views'
    end
    def self.env
      @env ||= ENV['RACK_ENV']
    end
  end
end

