import React from 'react';
import './HeaderVerse.css';

const verses: { text: string, verse: string }[] = [
    { text: "Commit your plans to God, and He'll make it happen.", verse: 'Proverbs 16:3 (interpreted)' },
    { text: 'The plans of the diligent lead surely to abundance, but everyone who is hasty comes only to poverty.', verse: 'Proverbs 21:5, ESV' },
    { text: 'Seek first the kingdom of God and his righteousness, and all these things will be added to you.', verse: 'Matthew 6:33, ESV' },
    { text: 'Teach us to number our days, that we may gain a heart of wisdom.', verse: 'Psalm 90:12, NIV' },
    { text: "'For I know the plans I have for you,' declares the LORD, 'plans for prosperity and not for disaster, to give you a future and a hope.'", verse: 'Jeremiah 29:11, NASB' },
    { text: "God says, 'try me in this: send me your tithe, and watch me open the windows of heaven excessively...'", verse: 'Malachi 3:10 (summarized by site author)' },
    { text: "One tenth of all the produce of the land, whether grain or fruit, belongs to the LORD.", verse: 'Leviticus 27:30, Good News Translation' },
    { text: "Count off every tenth animal from your herds and flocks and set them apart for the LORD as holy.", verse: 'Leviticus 27:32, NLT' },
    { text: "For what does it profit a man to gain the whole world and forfeit his soul?", verse: 'Mark 8:36, ESV' },
]

// a new one is selected every refresh
const selectedVerse = verses[Math.floor(Math.random() * verses.length)];

export const HeaderVerse = () => {
    return <div className="show-verse-on-hover">
        <span className="verse">{selectedVerse.text}</span>
        <span className="show-on-hover verse">&nbsp;{selectedVerse.verse}</span>
    </div>
}
