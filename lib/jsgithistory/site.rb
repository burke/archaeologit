require 'cgi'
require 'json'

module JSGitHistory
  class Site < Sinatra::Application
    set :public, App.public_path
    set :views,  App.view_path

    set :haml, {:format => :html5}

    get '/_tree' do
      repo_path = Repos.all[params[:repo].to_sym]
      halt 404 unless repo_path

      Git.repo(repo_path).ls_to_hash(:r).to_json    
    end

    get '/:repo/_authors' do
      repo_path = Repos.all[params[:repo].to_sym]
      halt 404 unless repo_path

      Git.repo(repo_path).authors.to_json
    end

    #TODO Gzip this, send with better content type.
    get '/_treelog' do
      repo_path = Repos.all[params[:repo].to_sym]
      halt 404 unless repo_path

      JSON.dump(Git.repo(repo_path).repo_history())
    end
    
    get '/:repo/' do
      haml :repo
    end
  
    get '/:repo/*' do 
      repo_path = Repos.all[params[:repo].to_sym]
      halt 404 unless repo_path
    
      path = path_from_splat(params[:splat])

      full_path = repo_path + '/'+ path
      if File.file?(full_path)
        git_output = Git.repo(App.root + repo_path).log(:reverse,:p => path).run.join("\n")
        @log = CGI.escapeHTML(CGI.escapeHTML(git_output))
        haml :log
      else 
        halt 404
      end
    end
    
    not_found do
      @repos = Repos.all
      haml :no_repo
    end

    # attempt to prevent traversal
    def no_traverse(path)
      return '/' unless path and path.first
    
      path = path.first
      safe_depth =      path.scan(/\/[\w_]/).length
      attempted_depth = path.scan(/\.\.\//).length
    
      safe_depth >= attempted_depth ? path : '/'
    end
    
    def path_from_splat(splat)
      return '/' unless splat or splat.any? # raise error or something
    
      no_traverse(splat.first)
    end
  end  
end 
