using System;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;

namespace RedInk
{
    [CreateAssetMenu(fileName = "GrammarQuestionBank", menuName = "RedInk/GrammarQuestionBank")]
    public class GrammarQuestionBank : ScriptableObject
    {
        public List<GrammarQuestion> questions = new List<GrammarQuestion>();

        public static GrammarQuestionBank CreateDefaultBank()
        {
            var bank = CreateInstance<GrammarQuestionBank>();
            bank.InitializeDefaultContent();
            return bank;
        }

        public void InitializeDefaultContent()
        {
            questions = GetDefaultQuestions();
        }

        public List<string> ValidateBank()
        {
            var errors = new List<string>();

            if (questions == null || questions.Count == 0)
            {
                errors.Add("Question bank is empty or null.");
                return errors;
            }

            var seenIds = new HashSet<string>();
            var categoryFamilies = new Dictionary<QuestionCategory, HashSet<string>>();

            foreach (QuestionCategory cat in Enum.GetValues(typeof(QuestionCategory)))
            {
                categoryFamilies[cat] = new HashSet<string>();
            }

            foreach (var q in questions)
            {
                if (q == null)
                {
                    errors.Add("Bank contains a null question entry.");
                    continue;
                }

                if (string.IsNullOrEmpty(q.id))
                {
                    errors.Add("A question has a null or empty ID.");
                }
                else if (seenIds.Contains(q.id))
                {
                    errors.Add($"Duplicate question ID found: '{q.id}'.");
                }
                else
                {
                    seenIds.Add(q.id);
                }

                if (string.IsNullOrEmpty(q.correctAnswer))
                {
                    errors.Add($"Question '{q.id}' has a null or empty correctAnswer.");
                }

                if (q.distractors == null || q.distractors.Length < 2)
                {
                    errors.Add($"Question '{q.id}' must have at least 2 distractors.");
                }
                else if (!string.IsNullOrEmpty(q.correctAnswer) && q.distractors.Contains(q.correctAnswer))
                {
                    errors.Add($"Question '{q.id}' lists its correctAnswer '{q.correctAnswer}' inside its distractors list.");
                }

                if (q.sentenceTemplates == null || q.sentenceTemplates.Length < 3)
                {
                    errors.Add($"Question '{q.id}' must have at least 3 sentence templates.");
                }
                else
                {
                    foreach (var t in q.sentenceTemplates)
                    {
                        if (string.IsNullOrEmpty(t) || !t.Contains("{blank}"))
                        {
                            errors.Add($"Question '{q.id}' template '{t}' is missing the '{{blank}}' token.");
                        }
                    }
                }

                if (!string.IsNullOrEmpty(q.ruleFamily))
                {
                    categoryFamilies[q.category].Add(q.ruleFamily);
                }
            }

            foreach (QuestionCategory cat in Enum.GetValues(typeof(QuestionCategory)))
            {
                if (categoryFamilies[cat].Count < 8)
                {
                    errors.Add($"Category '{cat}' has only {categoryFamilies[cat].Count} rule families, minimum required is 8.");
                }
            }

            return errors;
        }

        public static List<GrammarQuestion> GetDefaultQuestions()
        {
            var list = new List<GrammarQuestion>();

            // --- HOMOPHONES (8 Rule Families) ---
            list.Add(new GrammarQuestion(
                "homo_youre", QuestionCategory.Homophones, "your_youre",
                new[] {
                    "Please make sure {blank} ready before entering the exam room.",
                    "I hope {blank} feeling prepared for today's grammar trial.",
                    "If {blank} going to submit your response, double check it."
                },
                "you're", new[] { "your", "youre" }));

            list.Add(new GrammarQuestion(
                "homo_your", QuestionCategory.Homophones, "your_possessive",
                new[] {
                    "Do not forget to sign {blank} name on the official document.",
                    "Is this {blank} final attempt at solving the puzzle?",
                    "Please keep {blank} hands visible at all times."
                },
                "your", new[] { "you're", "yours" }));

            list.Add(new GrammarQuestion(
                "homo_theyre", QuestionCategory.Homophones, "there_their_theyre",
                new[] {
                    "The editors said {blank} going to review every submission.",
                    "Do you know if {blank} planning to open the final door?",
                    "It seems {blank} waiting for the chime to sound."
                },
                "they're", new[] { "there", "their" }));

            list.Add(new GrammarQuestion(
                "homo_its_contraction", QuestionCategory.Homophones, "its_it_is",
                new[] {
                    "The corridor is quiet, but {blank} clear that someone passed through.",
                    "Before entering, make sure {blank} understood that errors carry consequences.",
                    "Although the door is heavy, {blank} possible to open it."
                },
                "it's", new[] { "its", "its'" }));

            list.Add(new GrammarQuestion(
                "homo_too", QuestionCategory.Homophones, "to_too_two",
                new[] {
                    "The sentence contained far {blank} many errors to pass inspection.",
                    "Is this rule family {blank} difficult for the test candidate?",
                    "The ink on the page dried {blank} quickly to erase."
                },
                "too", new[] { "to", "two" }));

            list.Add(new GrammarQuestion(
                "homo_whos", QuestionCategory.Homophones, "whose_whos",
                new[] {
                    "Can you tell me {blank} responsible for maintaining the records?",
                    "Do you know {blank} standing on the other side of the door?",
                    "We need to find out {blank} turn it is to enter the room."
                },
                "who's", new[] { "whose", "whoses" }));

            list.Add(new GrammarQuestion(
                "homo_hear", QuestionCategory.Homophones, "hear_here",
                new[] {
                    "Did you {blank} the subtle chime echo down the hallway?",
                    "Listen closely if you wish to {blank} the tone of judgment.",
                    "You will {blank} three ascending notes when the answer is correct."
                },
                "hear", new[] { "here", "hears" }));

            list.Add(new GrammarQuestion(
                "homo_whether", QuestionCategory.Homophones, "weather_whether",
                new[] {
                    "The candidate hesitated, uncertain {blank} to turn left or right.",
                    "It matters little {blank} you agree with the rule or not.",
                    "You must decide {blank} to submit the option now."
                },
                "whether", new[] { "weather", "weathers" }));

            // --- COMMONLY CONFUSED (8 Rule Families) ---
            list.Add(new GrammarQuestion(
                "conf_effect", QuestionCategory.CommonlyConfused, "affect_effect",
                new[] {
                    "The red ink had an immediate visual {blank} on the portrait.",
                    "What was the main {blank} of the detuned chime on your composure?",
                    "The cumulative {blank} of several mistakes is catastrophic."
                },
                "effect", new[] { "affect", "effects" }));

            list.Add(new GrammarQuestion(
                "conf_than", QuestionCategory.CommonlyConfused, "then_than",
                new[] {
                    "A precise answer is far better {blank} a hasty guess.",
                    "The second room proved to be more demanding {blank} the first.",
                    "Nothing is worse {blank} losing your final feature."
                },
                "than", new[] { "then", "thans" }));

            list.Add(new GrammarQuestion(
                "conf_accept", QuestionCategory.CommonlyConfused, "accept_except",
                new[] {
                    "The gatekeeper will not {blank} any excuses for poor punctuation.",
                    "Will you {blank} the verdict delivered by the chime?",
                    "You must {blank} the consequences of your selection."
                },
                "accept", new[] { "except", "accepts" }));

            list.Add(new GrammarQuestion(
                "conf_lose", QuestionCategory.CommonlyConfused, "lose_loose",
                new[] {
                    "Be careful not to {blank} your focus during the final trial.",
                    "If you make eight mistakes, you will {blank} the run entirely.",
                    "Do not {blank} heart when the chime sounds harsh."
                },
                "lose", new[] { "loose", "loosed" }));

            list.Add(new GrammarQuestion(
                "conf_farther", QuestionCategory.CommonlyConfused, "further_farther",
                new[] {
                    "The candidate walked ten paces {blank} down the dark corridor.",
                    "The next room is situated three feet {blank} than expected.",
                    "She stepped two steps {blank} into the dimly lit hallway."
                },
                "farther", new[] { "further", "farthest" }));

            list.Add(new GrammarQuestion(
                "conf_complement", QuestionCategory.CommonlyConfused, "compliment_complement",
                new[] {
                    "The oxblood wainscoting served to {blank} the austere architecture.",
                    "Each puzzle component was designed to {blank} the overall atmosphere.",
                    "A good lighting design will {blank} the texture of the plaster."
                },
                "complement", new[] { "compliment", "complements" }));

            list.Add(new GrammarQuestion(
                "conf_advice", QuestionCategory.CommonlyConfused, "advise_advice",
                new[] {
                    "The examiner offered stern {blank} regarding proper usage.",
                    "Follow the written {blank} on the plaque before proceeding.",
                    "He ignored all good {blank} and suffered the penalty."
                },
                "advice", new[] { "advise", "advices" }));

            list.Add(new GrammarQuestion(
                "conf_principle", QuestionCategory.CommonlyConfused, "principal_principle",
                new[] {
                    "Clarity in writing is an unyielding grammatical {blank}.",
                    "The fundamental {blank} of this gauntlet is precision.",
                    "She refused to compromise on her core editorial {blank}."
                },
                "principle", new[] { "principal", "principals" }));

            // --- APOSTROHES (8 Rule Families) ---
            list.Add(new GrammarQuestion(
                "apos_singular_possessive", QuestionCategory.Apostrophes, "singular_possessive",
                new[] {
                    "The {blank} desk was covered in red ink and draft manuscripts.",
                    "We inspected the {blank} signature on the margin of the leaf.",
                    "The main {blank} authority was respected throughout the hall."
                },
                "editor's", new[] { "editors", "editors'" }));

            list.Add(new GrammarQuestion(
                "apos_plural_possessive", QuestionCategory.Apostrophes, "plural_possessive",
                new[] {
                    "The {blank} lounge remained silent during the evaluation.",
                    "All the {blank} reports were bound together in calfskin.",
                    "We examined the two {blank} credentials thoroughly."
                },
                "writers'", new[] { "writer's", "writers" }));

            list.Add(new GrammarQuestion(
                "apos_irregular_plural", QuestionCategory.Apostrophes, "irregular_plural_possessive",
                new[] {
                    "The {blank} grammar books were collected at the desk.",
                    "A special edition of {blank} fables sat on the pedestal.",
                    "The mentor corrected the {blank} spelling exercises."
                },
                "children's", new[] { "childrens'", "childrens" }));

            list.Add(new GrammarQuestion(
                "apos_its_possessive", QuestionCategory.Apostrophes, "its_possessive_no_apostrophe",
                new[] {
                    "The heavy door swung on {blank} rusty brass hinges.",
                    "The portrait retained {blank} haunting expression throughout.",
                    "The manuscript lost {blank} binding over time."
                },
                "its", new[] { "it's", "its'" }));

            list.Add(new GrammarQuestion(
                "apos_lets_contraction", QuestionCategory.Apostrophes, "lets_contraction",
                new[] {
                    "{blank} review the rule once more before pulling the lever.",
                    "{blank} verify the sentence structure before moving forward.",
                    "{blank} proceed cautiously into the next room."
                },
                "Let's", new[] { "Lets", "Let's'" }));

            list.Add(new GrammarQuestion(
                "apos_decade_plural", QuestionCategory.Apostrophes, "decade_plural_no_apostrophe",
                new[] {
                    "The archival texts were published in the late {blank}.",
                    "Style guides from the {blank} prohibited split infinitives.",
                    "Many classical grammar rules originated in the early {blank}."
                },
                "1990s", new[] { "1990's", "1990s'" }));

            list.Add(new GrammarQuestion(
                "apos_proper_s", QuestionCategory.Apostrophes, "proper_noun_possessive_s",
                new[] {
                    "We analyzed {blank} famous essay on syntax and style.",
                    "The plaque cited {blank} law of concord.",
                    "She borrowed {blank} copy of the style manual."
                },
                "James's", new[] { "James'", "Jamess" }));

            list.Add(new GrammarQuestion(
                "apos_whos_contraction", QuestionCategory.Apostrophes, "whos_contraction",
                new[] {
                    "{blank} turn is it to face the red ink trial?",
                    "{blank} going to explain the missing apostrophe?",
                    "{blank} prepared to take the final examination?"
                },
                "Who's", new[] { "Whose", "Whos'" }));

            // --- SUBJECT-VERB AGREEMENT (8 Rule Families) ---
            list.Add(new GrammarQuestion(
                "sva_collective_singular", QuestionCategory.SubjectVerbAgreement, "collective_noun_singular",
                new[] {
                    "The committee {blank} deciding the final grade of the candidate.",
                    "The panel {blank} preparing to render its verdict.",
                    "The editorial team {blank} reviewing every sentence carefully."
                },
                "is", new[] { "are", "were" }));

            list.Add(new GrammarQuestion(
                "sva_compound_and", QuestionCategory.SubjectVerbAgreement, "compound_subject_and",
                new[] {
                    "The reader and the editor {blank} inspecting the plaque text.",
                    "Both the tone and the cadence {blank} evaluated by the system.",
                    "Precision and speed {blank} required in this trial."
                },
                "are", new[] { "is", "was" }));

            list.Add(new GrammarQuestion(
                "sva_neither_nor", QuestionCategory.SubjectVerbAgreement, "neither_nor_singular",
                new[] {
                    "Neither the author nor the proofreader {blank} present in the hall.",
                    "Neither speed nor confidence {blank} sufficient without accuracy.",
                    "Neither door nor window {blank} open at this hour."
                },
                "is", new[] { "are", "were" }));

            list.Add(new GrammarQuestion(
                "sva_everyone_indefinite", QuestionCategory.SubjectVerbAgreement, "everyone_indefinite",
                new[] {
                    "Everyone in the exam hall {blank} expected to adhere to the rules.",
                    "Everyone who enters {blank} given a single chance per door.",
                    "Everyone on the review panel {blank} agreed on the standard."
                },
                "is", new[] { "are", "were" }));

            list.Add(new GrammarQuestion(
                "sva_intervening_phrase", QuestionCategory.SubjectVerbAgreement, "intervening_phrase",
                new[] {
                    "The box of rare manuscripts {blank} resting on the mahogany table.",
                    "The collection of classical rules {blank} preserved in stone.",
                    "The series of difficult trials {blank} designed to test endurance."
                },
                "was", new[] { "were", "are" }));

            list.Add(new GrammarQuestion(
                "sva_here_there_plural", QuestionCategory.SubjectVerbAgreement, "here_there_plural",
                new[] {
                    "Here {blank} the key choices for the current question.",
                    "There {blank} three distinct options presented on the plaque.",
                    "Here {blank} the results of your latest attempt."
                },
                "are", new[] { "is", "was" }));

            list.Add(new GrammarQuestion(
                "sva_amount_singular", QuestionCategory.SubjectVerbAgreement, "amount_singular",
                new[] {
                    "Ten dollars {blank} a reasonable price for a reference manual.",
                    "Fifty minutes {blank} all the time granted for the examination.",
                    "Five miles {blank} a long distance to walk through dark halls."
                },
                "is", new[] { "are", "were" }));

            list.Add(new GrammarQuestion(
                "sva_both_plural", QuestionCategory.SubjectVerbAgreement, "both_plural",
                new[] {
                    "Both options {blank} valid syntactic structures in isolation.",
                    "Both candidates {blank} completed the preliminary test.",
                    "Both doors {blank} unlocked under normal conditions."
                },
                "have", new[] { "has", "having" }));

            // --- PUNCTUATION (8 Rule Families) ---
            list.Add(new GrammarQuestion(
                "punc_comma_splice", QuestionCategory.Punctuation, "comma_splice_conjunction",
                new[] {
                    "The door remained locked{blank} the candidate reconsidered the sentence.",
                    "The chime sounded softly{blank} the warm light pulsed briefly.",
                    "She pulled the lever down{blank} the red ink began to flow."
                },
                ", and", new[] { " and", ",and" }));

            list.Add(new GrammarQuestion(
                "punc_introductory_comma", QuestionCategory.Punctuation, "introductory_clause_comma",
                new[] {
                    "After reading the plaque carefully{blank} candidate made her choice.",
                    "Before pulling the lever{blank} examine every option closely.",
                    "When the chime echoed{blank} room fell into total silence."
                },
                ", the", new[] { " the", "; the" }));

            list.Add(new GrammarQuestion(
                "punc_oxford_comma", QuestionCategory.Punctuation, "oxford_comma",
                new[] {
                    "The test required speed, precision{blank} total composure.",
                    "We reviewed grammar, spelling{blank} punctuation.",
                    "The room contained a plaque, a lever{blank} a portrait frame."
                },
                ", and", new[] { " and", " &" }));

            list.Add(new GrammarQuestion(
                "punc_semicolon_independent", QuestionCategory.Punctuation, "semicolon_independent",
                new[] {
                    "The first answer was incorrect{blank} the candidate was granted a second try.",
                    "The door did not budge{blank} the red ink stained the portrait.",
                    "The time ran short{blank} she proceeded without hesitation."
                },
                "; however,", new[] { ", however,", " however," }));

            list.Add(new GrammarQuestion(
                "punc_colon_intro", QuestionCategory.Punctuation, "colon_introduction",
                new[] {
                    "The plaque displayed a clear requirement{blank} mastery of concords.",
                    "Only one condition remained{blank} total accuracy across all rooms.",
                    "He noticed a single inscription{blank} red ink never fades."
                },
                ": the", new[] { "; the", ", the" }));

            list.Add(new GrammarQuestion(
                "punc_quote_inside", QuestionCategory.Punctuation, "quote_punctuation_inside",
                new[] {
                    "The guide stated, \"Always check for syntax {blank}",
                    "The plaque read, \"Precision is required {blank}",
                    "She remembered the phrase, \"Erase all errors {blank}"
                },
                "errors.\"", new[] { "errors\".", "errors\"." }));

            list.Add(new GrammarQuestion(
                "punc_nonrestrictive_clause", QuestionCategory.Punctuation, "nonrestrictive_clause_commas",
                new[] {
                    "The manuscript{blank} was placed in the archive vault.",
                    "The plaque{blank} hung on the mahogany panel.",
                    "The red ink portrait{blank} reflected her remaining features."
                },
                ", which was approved,", new[] { " which was approved,", "; which was approved;" }));

            list.Add(new GrammarQuestion(
                "punc_parenthetical_comma", QuestionCategory.Punctuation, "parenthetical_comma",
                new[] {
                    "The candidate{blank} was determined to finish the gauntlet.",
                    "The examiner{blank} remained completely impassive.",
                    "The result{blank} depended entirely on her diligence."
                },
                ", however,", new[] { " however", "; however;" }));

            return list;
        }
    }
}
