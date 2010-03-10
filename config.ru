require File.expand_path('../config/boot',__FILE__)

use Rack::Auth::Basic do |username, password|
  [username, password] == ['play', 'nicely']
end

run JSGitHistory::Site.new

