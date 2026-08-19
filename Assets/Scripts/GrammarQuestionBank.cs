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

// In Unity this would be [CreateAssetMenu(...)]
public class GrammarQuestionBank : UnityEngine.ScriptableObject
{
    public List<RuleFamily> ruleFamilies = new List<RuleFamily>();

    public GrammarQuestionBank()
    {
    }

    public static GrammarQuestionBank CreateSeedContentSet()
    {
        var bank = ScriptableObject.CreateInstance<GrammarQuestionBank>();
        bank.ruleFamilies = new List<RuleFamily>();

        string[] categories = { "YourYoure", "ItsIts", "ThereTheirTheyre", "AffectEffect", "ThenThan" };

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
                    string correctAnswer = "right";
                    var distractors = new List<string> { "wrong1", "wrong2" };

                    // Add some realish fake content
                    if (category == "YourYoure")
                    {
                        correctAnswer = "you're";
                        distractors = new List<string> { "your", "yore" };
                    }
                    else if (category == "ItsIts")
                    {
                        correctAnswer = "it's";
                        distractors = new List<string> { "its", "its'" };
                    }

                    family.templates.Add(new GrammarQuestion
                    {
                        id = $"{family.id}_T_{j}",
                        ruleFamily = family.id,
                        category = category,
                        template = $"The {i}{j} subject is sure {{blank}} going to win.",
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
