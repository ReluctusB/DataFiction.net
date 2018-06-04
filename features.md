# DataFiction.Net
DataFiction.Net provides users of Fimfiction with useful data on stories and authors at a glance. It does this by scraping data from the currently viewed page. All of its features can be turned on or off at the user's discretion through Fimfiction's Local Settings page.

A word of caution: there is no objective, quantitative way to properly judge the quality of a story or an author. Do not operate under the assumption that anything provided in this userscript can do so. The tools in this script are merely meant to provide users with an abundance of more accurate information. They can aid the decision-making process, but they shouldn't make your decisions for you.

## Features:
### Votes/Views Percentage
The Votes/Views feature displays the percentage of readers who have upvoted a story. This information is displayed at the end of story cards and beside the ratings bar on story pages. In addition, the percentage will highlight green when above a user-specified threshold, which defaults to 10%. Highlighting can be disabled by leaving the field (found on the Local Settings page) blank.

The Votes/Views percentage is **not** an objective measure of a story's quality. Rather, it is an indicator of a story's relative *success.* A well-marketed story will get a better percentage than a poorly-marketed one, and a story in a less popular genre or containing sensitive subjects may also have skewed results. In addition, more recent popular stories (such as those in the featured box) are likely to have higher percentages, but will gradually normalize as time goes on. Consider it a factor when deciding if a story may be worth reading.

### Followers/Fic Ratio
The Followers/Fic Ratio feature displays the ratio of followers to fics an author has accrued. This information is displayed in the tabs bar at the top of an author's page, and in parenthesis next to their follower count on their card. On mobile, it can be found in the dropdown next to an author's name on their pages. It will not display if an author has no stories.

The followers/fic ratio is influenced by many factors, including writing quality, marketing ability, blog quality, preexisting ability, social standing, and a smidge of dumb luck. The followers/fic ratio is **not** an objective, end-all measure of the current strength of an author's writing so much as it is of the strength of their writing and site presence over their career. It can also be easily improved by deleting stories, so take it with a grain of salt.

### Personalized Reading Times
The Personalized Reading Times feature provides estimated reading times of stories or groups of stories that are based on the user's provided reading speed. They are displayed in place of the existing estimate on search pages and bookshelves, and beside the total word count of stories on their pages and when in full view. They are also slightly more precise than Fimfiction's estimate, and go up to years instead of stopping at weeks. 

The reading speed defaults to the national average of 250. To use this feature properly, you'll want to input your personal reading speed in words per minute (WPM) into the text field in the Local Settings page. To find your WPM, use this simple test: [What speed do you read?](https://www.staples.com/sbd/cre/marketing/technology-research-centers/ereaders/speed-reader/iframe.html)

### Average Post Schedule
The Average Post Schedule feature displays the average time between a story's chapter postings, and the time since the last chapter was posted. They are displayed below the chapter list on a story's page and in a list of stories when in full view. In addition, the estimated date of the next chapter will be displayed if you hover over the average. By default, average post times will only display on stories marked "Incomplete", and time since last update will only be displayed on stories marked either "Incomplete" or "On Hiatus". These can be made to display on all stories by turning on the "Display regardless of completion" option from the Local Settings page.

## Chapter Analysis
The Chapter Analysis feature adds an extra button to the chapter toolbar that, when clicked, will display a popup containing information about that chapter. That information includes:
- Word, paragraph, sentence and paragraph counts
- Readability metrics
  - [Automated Readability Index (ARI)](https://en.wikipedia.org/wiki/Automated_readability_index) score and age level. Unlike other readability metrics, the ARI is calculated using character counts rather than syllable counts, making it the only metric that can be calculated automatically with guarenteed accuracy.
  - [Flesch Reading Ease](https://en.wikipedia.org/wiki/Flesch%E2%80%93Kincaid_readability_tests#Flesch_reading_ease) score.
  - [Flesch-Kinkaid Grade Level](https://en.wikipedia.org/wiki/Flesch%E2%80%93Kincaid_readability_tests#Flesch%E2%80%93Kincaid_grade_level).
  - [SMOG](https://en.wikipedia.org/wiki/SMOG). Note that this is SMOG itself, not the SMOG Index. Although many readability scorers use the SMOG Index (oftentimes not making the distinction), it is a simplified measurement designed to be easier to calculate, rather than to be more accurate. Also note that the SMOG score is invalid when applied to texts containing less than thirty sentences (don't worry; the analyzer will remind you if this is the case).
  
  It is worth noting that, with the notable exception of the ARI, most reabaility metrics are syllable-based. It is impossible to accurately count syllables in English automatically with 100% accuracy, though I've done my absolute best to get close. As such, though they should be fairly accurate in most cases, these scores are *estimates*.
  It is also worth noting that the grade levels given by these metrics are based on the standard American education system.
- The top ten most frequent uncommon words in the text and the number of times they occur, arranged in order of prevalence
- The number of occurances of all words in the chapter, arranged in order of prevalence (hidden initially to improve performance)
