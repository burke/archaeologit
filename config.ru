require "rubygems"
require "bundler"
Bundler.setup

require File.expand_path('../lib/jsgithistory', __FILE__)
run JSGitHistory::Site.new

