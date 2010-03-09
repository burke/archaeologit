set :application, "jsgithistory.53cr.com"
set :repository,  "git@github.com:burke/jsgithistory.git"

set :scm, :git
set :deploy_to, '/srv/rack/jsgithistory.53cr.com/'
set :use_sudo, false
set :branch, "test"

server "jsgithistory.53cr.com", :app, :web, :db, :primary => true

set :default_environment, { 
  'PATH' => "/opt/ruby-enterprise-1.8.7-2010.01/bin/:/opt/ruby-enterprise-1.8.7-2010.01/lib/ruby/gems/1.8/:$PATH",
  'RUBY_VERSION' => 'ruby 1.8.7',
}

namespace :deploy do
  task :start do end
  task :stop  do end
  task :restart, :roles => :app, :except => { :no_release => true } do
    run "touch #{File.join(current_path,'tmp','restart.txt')}"
  end
end

namespace :bundler do
  task :install do
    run("#{sudo} gem install bundler --source=http://gemcutter.org")
  end
 
  task :bundle_new_release do
    # Only use cached gems when expanding the bundle
    run("cd #{release_path} && bundle install ../shared/vendor/gems --without test development")
  end
end
 
after 'deploy:update_code', 'bundler:bundle_new_release'
