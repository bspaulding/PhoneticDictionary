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
  needle_phoneme = dictionary.fetch(needle.upcase)
  puts needle_phoneme.join(' ')
  results = []

  potential_rhymes = dictionary.reject {|word, phoneme| word == needle.upcase || phoneme[-1] != needle_phoneme[-1] }
  puts "potential_rhymes.count => #{potential_rhymes.count}"
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
      results << {
        word: word,
        score: score,
        phonemes: phoneme
      }
    end
  end

  results.sort_by {|i| i[:score] }
rescue IndexError
  puts "Unfortunately, that word is not in this dictionary."

  nil
end

puts "Lookup a word: "
needle = gets[0...-1]
rhymes = lookup(needle, dictionary)
puts "Phonetic Results for '#{needle}': (#{rhymes.size} #{(rhymes.size != 1) ? 'rhymes' : 'rhyme'})"
rhymes.sort_by {|i| i[:score] }.reverse.each { |result| puts "[#{result[:score].to_i}%] #{result[:word]}\t#{result[:phonemes].join(' ')}" }
