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

    get '/:repo/' do
      haml :repo
    end
  
    get '/:repo/*' do 
      repo_path = Repos.all[params[:repo].to_sym]
      halt 404 unless repo_path
    
      path = path_from_splat(params[:splat])

      if File.file?(path)
        puts  Git.repo(App.root + repo_path).log(:reverse,:p => path).inspect
        git_output = Git.repo(App.root + repo_path).log(:reverse,:p => path).run.join("\n")
        
        @log = CGI.escapeHTML(CGI.escapeHTML(git_output))

        haml :log

      elsif File.directory?(path)
        unless params[:splat][0].empty? or params[:splat][0][-1].chr == "/"
          redirect "/#{params[:repo]}/#{params[:splat]}/"
        end
        
        entries = Dir.entries(path).reject do |entry|
          entry =~ /^\./
        end.group_by do |file| 
          File.directory?(File.join(path,file)) ? :directory : :file
        end

        @parent_directory = splat_path.sub(/\/$/,'').split('/')[0..-2].join('/')
        @parent_directory = "/#{params[:repo]}/#{@parent_directory}/".sub('//','/')
        @files   = entries[:file]      || []
        @folders = entries[:directory] || []
    
        haml :index
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
