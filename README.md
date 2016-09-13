Pride and Prejudice in its entirety, sorted by the visual weight of its characters. The weight calculation could use some work.

_Update:_ Looks like GitHub has a README length limit, so I'm hosting it [here](http://rileyjshaw.com/pride-and-prejudice) instead.

Constructed with text from [Project Gutenberg](https://www.gutenberg.org/ebooks/1342).

To add your own text:

```
git clone https://github.com/rileyjshaw/pride-and-prejudice.git
cd pride-and-prejudice
# Put a plain text file in this directory, then:
node deconstruct.js <your.txt>
open index.html
```

To hack on the code:

```
git clone https://github.com/rileyjshaw/pride-and-prejudice.git
cd pride-and-prejudice
npm i
# Hack on the files within src/, then:
npm run build
```

License is MIT.
