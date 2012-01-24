#! /usr/bin/env ruby

filepath = "./pgwht04.txt"
dict = File.new(filepath, 'r')
puts "Loading Dictionary..."
dictionary = dict.read
puts "Complete."

def define(aWord, dictionary)
  dictionary.match(/\<h1\>#{aWord}\<\/h1\>/i)
end

puts dictionary.size

puts "Define a Word: "
puts define(gets.to_s, dictionary)