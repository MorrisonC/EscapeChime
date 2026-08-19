using System.Collections.Generic;
using System.Linq;
using NUnit.Framework;
using RedInk;

namespace RedInk.Tests.EditMode
{
    [TestFixture]
    public class GrammarQuestionBankValidationTests
    {
        private GrammarQuestionBank bank;

        [SetUp]
        public void SetUp()
        {
            bank = GrammarQuestionBank.CreateDefaultBank();
        }

        [Test]
        public void EveryQuestion_HasNonNullCorrectAnswer()
        {
            foreach (var q in bank.questions)
            {
                Assert.That(q.correctAnswer, Is.Not.Null.And.Not.Empty, $"Question {q.id} has null or empty correct answer");
            }
        }

        [Test]
        public void EveryQuestion_CorrectAnswerIsNotAlsoListedAsDistractor()
        {
            foreach (var q in bank.questions)
            {
                Assert.That(q.distractors, Is.Not.Null);
                Assert.That(q.distractors.Contains(q.correctAnswer), Is.False, $"Question {q.id} lists correct answer in distractors");
            }
        }

        [Test]
        public void EveryRuleFamily_HasAtLeastMinimumTemplateCount()
        {
            foreach (var q in bank.questions)
            {
                Assert.That(q.sentenceTemplates, Is.Not.Null);
                Assert.That(q.sentenceTemplates.Length, Is.GreaterThanOrEqualTo(3), $"Rule family {q.ruleFamily} has fewer than 3 sentence templates");
            }
        }

        [Test]
        public void EveryCategory_HasAtLeastMinimumRuleFamilyCount()
        {
            var categoryFamilies = bank.questions
                .GroupBy(q => q.category)
                .ToDictionary(g => g.Key, g => g.Select(q => q.ruleFamily).Distinct().Count());

            foreach (QuestionCategory cat in System.Enum.GetValues(typeof(QuestionCategory)))
            {
                Assert.That(categoryFamilies.ContainsKey(cat), Is.True, $"Category {cat} is missing in bank");
                Assert.That(categoryFamilies[cat], Is.GreaterThanOrEqualTo(8), $"Category {cat} has fewer than 8 rule families");
            }
        }

        [Test]
        public void NoDuplicateQuestionIDsInBank()
        {
            var ids = bank.questions.Select(q => q.id).ToList();
            var duplicateIds = ids.GroupBy(id => id).Where(g => g.Count() > 1).Select(g => g.Key).ToList();

            Assert.That(duplicateIds, Is.Empty, $"Duplicate question IDs found: {string.Join(", ", duplicateIds)}");
        }
    }
}
