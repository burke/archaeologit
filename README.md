## What is this?

JS Git History is an uncreatively-named app that lets you
interactively browse the revision history of individual files in a git
repository.

## Installation

First, copy `repositories.sample.yml` to `repositories.yml` or
`~/.jgshistory/repositories.yml` and edit it to include whichever
repositories you want to track.

Make sure you have the `bundler` gem installed, then run:

    bundle install
    rackup -p 4000

That's it! You should be up and running. Fire up
`http://localhost:4000` in a web browser and have a look around.
