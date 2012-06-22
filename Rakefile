task :default => ['assets:compile']

namespace :assets do
  namespace :compile do
    task :all => [:apple_touch_icon, :apple_touch_startup_image]

    task :apple_touch_icon do
      render_document_at_sizes('apple-touch-icon', [
        { width: 57,  height: 57  },
        { width: 72,  height: 72  },
        { width: 114, height: 114 },
        { width: 144, height: 144 },
        { width: 512, height: 512 }
      ])
    end

    task :apple_touch_startup_image do
      render_document_at_sizes('apple-touch-startup-image', [
        # web-app startup images are 20px shorter to accomodate status bar.
        { width: 320,  height: 460  },
        { width: 640,  height: 920  },
        { width: 768,  height: 1004 },
        { width: 1024, height: 748  },
        { width: 1536, height: 2008 },
        { width: 2048, height: 1496 },
        # normal splash screen sizes - for PhoneGap:Build
        { width: 320,  height: 480  },
        { width: 640,  height: 960  },
        { width: 768,  height: 1024 },
        { width: 1024, height: 768  },
        { width: 1536, height: 2048 },
        { width: 2048, height: 1536 }
      ])
    end

    def render_document_at_sizes(filename, sizes)
      sizes.each {|size| `wkhtmltoimage --width #{size[:width]} --height #{size[:height]} -f png assets/#{filename}.html images/#{filename}-#{size[:width]}x#{size[:height]}.png` }
    end
  end
  task :compile => ['compile:all']
end

desc "Calculate missing words."
task :stats do
  words = File.read("words").split("\n").map(&:downcase).uniq
  phonetic_entries = File.read("PhoneticDictionary.txt").split("\n")
  phonetic_words = phonetic_entries.map {|line| line.split(" ").first.gsub(/[^a-z]/i, '').downcase }.uniq

  puts "Total Words: #{words.count}"
  puts "Defined Words: #{phonetic_words.count} (#{(phonetic_words.count / words.count.to_f * 100.0).to_i}%)"
  puts "Undefined Words: #{words.count - phonetic_words.count}"
end

desc "Show undefined words."
task :undefined_words do
  words = File.read("words").split("\n").map(&:downcase).uniq
  phonetic_entries = File.read("PhoneticDictionary.txt").split("\n")
  phonetic_words = phonetic_entries.map {|line| line.split(" ").first.gsub(/[^a-z]/i, '').downcase }.uniq

  puts words - phonetic_words
end

desc "Show phonemes."
task :phonemes do
  phonetic_entries = File.read("PhoneticDictionary.txt").split("\n")
  phonemes = phonetic_entries.map {|entry| entry.split(" ")[1..-1] }.flatten.uniq

  puts phonemes.sort
end