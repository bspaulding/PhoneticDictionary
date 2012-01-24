#! /usr/bin/ruby

filepath = "./PhoneticDictionary.txt"
dict = File.new(filepath, 'r')
dictionary = {}

puts "Loading Phonetic Dictionary..."
while line = dict.gets
  tokens = line.split(" ")
  word = tokens[0]
  phonemes = tokens[1..-1]
  dictionary[word.to_s] = phonemes
end
puts "Loading Complete. #{dictionary.size} words."

def lookup(needle, dictionary)
  begin
    needle_phoneme = dictionary.fetch(needle.upcase)
    puts needle_phoneme.join(' ')
    results = []

    potential_rhymes = dictionary.reject {|word, phoneme| word == needle.upcase || phoneme[-1] != needle_phoneme[-1] }
    potential_rhymes.each_pair do |word, phoneme|
      score = 1.0 # max score is phoneme.size, i.e. all syllables match phonetically
      length = [needle_phoneme.size, phoneme.size].min
      (-length..-2).to_a.reverse.each do |i|
        if phoneme[i] == needle_phoneme[i]
          score += 1.0
        else
          break
        end
      end

      unless score == 1.0
        score /= needle_phoneme.size.to_f
        score *= 100
        results << [word, score, phoneme.join(' ')]
      end
    end
    results.sort! {|x,y| y[1] <=> x[1] } #.sort! {|x,y| y[1] <=> x[1] }
    return results
  rescue IndexError
    puts "Unfortunately, that word is not in this dictionary."
    return nil
  end
end

puts "Lookup a word: "
needle = gets[0...-1]
rhymes = lookup(needle, dictionary)
puts "Phonetic Results for '#{needle}': (#{rhymes.size} #{(rhymes.size != 1) ? 'rhymes' : 'rhyme'})"
#10.times {|i| puts "[#{rhymes[i][1]}] #{rhymes[i][0]}" }
rhymes.sort {|a,b| a[0] <=> b[0] }.each { |result| puts "[#{result[1].to_i}%] #{result[0]}\t#{result[2]}" }
# puts rhymes.collect {|x| x[0].downcase }.join(', ')
