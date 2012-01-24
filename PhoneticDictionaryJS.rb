filepath = "/Users/brads/Documents/Development/PhoneticDictionary/PhoneticDictionary.txt"
dict = File.new(filepath, 'r')

outfile = File.new("PhoneticDictionary.js", 'w+')
outfile.write "PhoneticDictionary = {\n"

reading = true
while reading
  line = dict.gets
  tokens = line.split(" ")
  word = tokens[0]
  phonemes = tokens[1..-1]
  phonemestr = phonemes.collect { |x| "'#{x}'" }.join(',')
  outfile.write "\t\"#{tokens[0]}\" : [#{phonemestr}]"
  reading = (line = dict.gets)
  (line.nil?) ? outfile.write("\n") : outfile.write(",\n")
end

outfile.write "}"