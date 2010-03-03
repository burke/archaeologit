begin
  # Require the preresolved locked set of gems.
  require File.expand_path('../../.bundle/environment', __FILE__)
rescue LoadError
  # Fallback on doing the resolve at runtime.
  require "rubygems"
  require "bundler"
  Bundler.setup
end

Bundler.require(:default)

require File.expand_path('../app',__FILE__)

JSGitHistory::App.initialize!

$:.unshift File.expand_path('../../lib/',__FILE__)

require 'jsgithistory'
