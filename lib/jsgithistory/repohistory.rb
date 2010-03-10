require 'rubygems'
require 'json'

class RepoHistory

  CHANGE_TYPES = { "A" => :add, "D" => :delete }

  attr_reader :commits_json, :commits
  
  def initialize(path)
    @path = path
    @commits = []

    IO.popen("git whatchanged --format=fuller | grep -v '^:.* M\t'") do |io|
      commit = {:message => "", :changes => {:add => [], :delete => []}}
      state = 0
      io.each do |line|
        state = 7 if line =~ /^:/
        if line =~ /^c/
          state = 0
          commit[:message].strip!
          @commits << commit
          commit = {:message => "", :changes => {:add => [], :delete => []}}
        end
        
        case state 
        when 0 # commit hash
          commit[:hash]        = line[7..-2]
        when 1 # original author
          commit[:author]      = line[12..-2]
        when 2 # author commit date
          commit[:author_date] = line[12..-2]
        when 3 # commiter
          commit[:committer]   = line[12..-2]
        when 4 # commit date
          commit[:commit_date] = line[12..-2]
        when 5 # blank line before commit message
        when 6 # commit message
          commit[:message] << (line[4..-1] || "\n")
        when 7
          commit[:changes][CHANGE_TYPES[line[37].chr]] << line[39..-2] unless line[37].nil?
        end
     
        state += 1 if state < 6
      end
    end
     
    @commits_json = JSON.dump(@commits)
  end
end
