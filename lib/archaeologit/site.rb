require 'cgi'
require 'sinatra'

module Archaeologit
  ROOT = Pathname.new(File.expand_path('../../../', __FILE__))

  class Site < Sinatra::Application
    set :public, ROOT + 'public'
    set :views,  ROOT + 'views'

    get '/:repo/:ref/*' do
      @log = CGI.escapeHTML(CGI.escapeHTML(reconstruction))
      erb :log
    end

    private

    def reconstruction
      git_output = Repository.new(params[:repo]).
        reconstruction(params[:ref], path_from_splat(params[:splat]))
    end

    def path_from_splat(splat)
      splat.join('/')
    end

  end
end

