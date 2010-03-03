class Git
  def initialize(path)
    @path = path
  end
  def self.repo(path)
    new(path)
  end
  def log(file)

    result = ''
    FileUtils.cd( @path) do
      result = `git log -p #{file}`
    end

    result
  end
end