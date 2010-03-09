require File.expand_path('../config/boot',__FILE__)

use Rack::Auth::Basic do |username, password|
  [username, password] == ['admin', 'admin']
end

run JSGitHistory::Site.new

