require "rubygems"
require "bundler"
Bundler.setup

require 'rack/coffee'
use Rack::Coffee, {
  :root => File.expand_path('../public', __FILE__),
  :urls => '/js'
}

require File.expand_path('../lib/jsgithistory', __FILE__)
run JSGitHistory::Site.new

