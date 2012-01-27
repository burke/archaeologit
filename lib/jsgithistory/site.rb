require 'cgi'
require 'json'
require 'sinatra'
require 'ruby-debug'

module JSGitHistory
  ROOT = Pathname.new(File.expand_path('../../../',__FILE__))

  class Site < Sinatra::Application
    set :public, ROOT + 'public'
    set :views,  ROOT + 'views'

    get '/:repo/:ref/*' do
      repo = Repository.new(params[:repo])
      path = path_from_splat(params[:splat])
      git_output = repo.log_stuff(params[:ref], path)
      @log = CGI.escapeHTML(CGI.escapeHTML(git_output))
      erb :log
    end

    def path_from_splat(splat)
      splat.join('/')
    end

  end
end

