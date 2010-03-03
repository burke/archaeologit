require 'rubygems' rescue LoadError
require 'sinatra'
require 'haml'

PATH = "/Users/burke/src/rails"

get '*' do 
  # TODO make this safe.
  full_path = "#{PATH}#{params[:splat]}"
  if File.file?(full_path)
    log = `cd #{PATH}; git log -p #{full_path}`
    haml :log, :locals => { :log => log }
  elsif File.directory?(full_path)
    entries = Dir.entries(full_path).reject{|e|e=~/^\./}
    haml :index, :locals => { :entries => entries }
  else 
    "INCORRECT PATH"
  end
end
