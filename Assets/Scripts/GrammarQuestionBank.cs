using System;
using System.Collections.Generic;

#if !UNITY_5_3_OR_NEWER
namespace UnityEngine
{
    public class ScriptableObject
    {
        public static T CreateInstance<T>() where T : ScriptableObject, new()
        {
            return new T();
        }
    }
}
#else
using UnityEngine;
#endif

[Serializable]
public class GrammarQuestion
{
    public string id = "";
    public string ruleFamily = "";
    public string category = "";

    // The sentence with a {blank} placeholder
    public string template = "";

    public string correctAnswer = "";
    public List<string> distractors = new List<string>();
}

[Serializable]
public class RuleFamily
{
    public string id = "";
    public string category = "";
    public List<GrammarQuestion> templates = new List<GrammarQuestion>();
}

public class GrammarQuestionBank : UnityEngine.ScriptableObject
{
    public List<RuleFamily> ruleFamilies = new List<RuleFamily>();

    public GrammarQuestionBank()
    {
    }

    public static GrammarQuestionBank CreateSeedContentSet()
    {
        var bank = UnityEngine.ScriptableObject.CreateInstance<GrammarQuestionBank>();
        bank.ruleFamilies = new List<RuleFamily>();

        string[] categories = { "Homophones", "CommonlyConfused", "Apostrophes", "SubjectVerbAgreement", "Punctuation" };

        foreach (var category in categories)
        {
            // 8 rule families per category
            for (int i = 0; i < 8; i++)
            {
                var family = new RuleFamily
                {
                    id = $"{category}_Rule_{i}",
                    category = category,
                    templates = new List<GrammarQuestion>()
                };

                // 3 templates per rule family
                for (int j = 0; j < 3; j++)
                {
                    string correctAnswer;
                    List<string> distractors;
                    string templateText;

                    switch (category)
                    {
                        case "Homophones":
                            if (i % 2 == 0)
                            {
                                correctAnswer = "you're";
                                distractors = new List<string> { "your", "yore" };
                                templateText = j == 0 ? "Make sure {blank} ready for the examination."
                                             : j == 1 ? "I think {blank} going to pass the corridor."
                                             : "Remember that {blank} responsible for your own face.";
                            }
                            else
                            {
                                correctAnswer = "they're";
                                distractors = new List<string> { "there", "their" };
                                templateText = j == 0 ? "Listen closely, {blank} locking the heavy oak doors."
                                             : j == 1 ? "Do not go in when {blank} preparing the next room."
                                             : "The redacted subjects say {blank} never leaving.";
                            }
                            break;

                        case "CommonlyConfused":
                            if (i % 2 == 0)
                            {
                                correctAnswer = "affect";
                                distractors = new List<string> { "effect", "infect" };
                                templateText = j == 0 ? "The dark red ink will {blank} your vision."
                                             : j == 1 ? "How does missing an ear {blank} your hearing?"
                                             : "Stress can severely {blank} your judgment in trial {blank}.";
                            }
                            else
                            {
                                correctAnswer = "than";
                                distractors = new List<string> { "then", "them" };
                                templateText = j == 0 ? "Silence is better {blank} a corrupted chime."
                                             : j == 1 ? "He made more mistakes {blank} anyone else today."
                                             : "It was colder in this hallway {blank} the previous one.";
                            }
                            break;

                        case "Apostrophes":
                            if (i % 2 == 0)
                            {
                                correctAnswer = "it's";
                                distractors = new List<string> { "its", "its'" };
                                templateText = j == 0 ? "The clock ticks because {blank} time for trial."
                                             : j == 1 ? "Do you hear that? {blank} the G-E-C chime."
                                             : "Never open the door when {blank} still locked.";
                            }
                            else
                            {
                                correctAnswer = "dog's";
                                distractors = new List<string> { "dogs", "dogs'" };
                                templateText = j == 0 ? "The feral {blank} collar clicked against the tile."
                                             : j == 1 ? "She found the old {blank} leash near the threshold."
                                             : "We could hear the guard {blank} steady breathing.";
                            }
                            break;

                        case "SubjectVerbAgreement":
                            if (i % 2 == 0)
                            {
                                correctAnswer = "is";
                                distractors = new List<string> { "are", "were" };
                                templateText = j == 0 ? "Neither of the redacted faces {blank} whole."
                                             : j == 1 ? "Each of the doors {blank} painted in dark lacquer."
                                             : "Everyone in these corridors {blank} seeking an exit.";
                            }
                            else
                            {
                                correctAnswer = "have";
                                distractors = new List<string> { "has", "having" };
                                templateText = j == 0 ? "The students in the front row {blank} answered."
                                             : j == 1 ? "Both keyholders {blank} vanished into the shadow."
                                             : "All eight features {blank} faded into dark ink.";
                            }
                            break;

                        case "Punctuation":
                        default:
                            if (i % 2 == 0)
                            {
                                correctAnswer = "however,";
                                distractors = new List<string> { "however", "however;" };
                                templateText = j == 0 ? "The door appeared unlocked; {blank} it was sealed fast."
                                             : j == 1 ? "I wished to flee; {blank} I forced myself forward."
                                             : "The chime was clear; {blank} the echo sounded wrong.";
                            }
                            else
                            {
                                correctAnswer = "said,";
                                distractors = new List<string> { "said", "said;" };
                                templateText = j == 0 ? "The instructor {blank} \"Fill in the placeholder.\""
                                             : j == 1 ? "A voice behind the plaque {blank} \"Choose wisely.\""
                                             : "The warden {blank} \"The eighth mark is fatal.\"";
                            }
                            break;
                    }

                    // Ensure every template string definitely has the {blank} placeholder
                    if (!templateText.Contains("{blank}"))
                    {
                        templateText += " {blank}";
                    }

                    family.templates.Add(new GrammarQuestion
                    {
                        id = $"{family.id}_T_{j}",
                        ruleFamily = family.id,
                        category = category,
                        template = templateText,
                        correctAnswer = correctAnswer,
                        distractors = distractors
                    });
                }

                bank.ruleFamilies.Add(family);
            }
        }

        return bank;
    }
}
