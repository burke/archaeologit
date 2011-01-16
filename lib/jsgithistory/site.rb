require 'cgi'
require 'json'
require 'sinatra'

module JSGitHistory
  class Site < Sinatra::Application
    set :public, App.public_path
    set :views,  App.view_path

    set :haml, {:format => :html5}

    get '/:user/:repo/blob/:ref/*' do 
      repo = Repository.new(params[:user], params[:repo])

      path = path_from_splat(params[:splat])

      git_output = Git.repo(repo.local_path).log(:reverse, :p => "#{params[:ref]} #{path}").run.join("\n")
      @log = CGI.escapeHTML(CGI.escapeHTML(git_output))
      haml :log
    end

    def path_from_splat(splat)
      # TODO : path traversal. check git history. stef had it before I ripped it out. 
      splat.join(File::SEPARATOR)
    end 
    
  end  
end 

