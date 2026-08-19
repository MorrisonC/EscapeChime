using NUnit.Framework;
using RedInk;

namespace RedInk.Tests.EditMode
{
    [TestFixture]
    public class TrialResolverTests
    {
        private GrammarQuestion question;

        [SetUp]
        public void SetUp()
        {
            question = new GrammarQuestion(
                "test_q", QuestionCategory.Homophones, "your_youre",
                new[] { "Template A {blank}", "Template B {blank}", "Template C {blank}" },
                "you're",
                new[] { "your", "youre" }
            );
        }

        [Test]
        public void CorrectAnswer_ReturnsCorrectOutcome()
        {
            var outcome = TrialResolver.EvaluateAnswer(question, "you're");
            Assert.That(outcome, Is.EqualTo(TrialOutcome.Correct));
        }

        [Test]
        public void IncorrectAnswer_ReturnsIncorrectOutcome()
        {
            var outcome1 = TrialResolver.EvaluateAnswer(question, "your");
            var outcome2 = TrialResolver.EvaluateAnswer(question, "youre");
            var outcome3 = TrialResolver.EvaluateAnswer(question, "wrong");

            Assert.That(outcome1, Is.EqualTo(TrialOutcome.Incorrect));
            Assert.That(outcome2, Is.EqualTo(TrialOutcome.Incorrect));
            Assert.That(outcome3, Is.EqualTo(TrialOutcome.Incorrect));
        }

        [Test]
        public void AfterIncorrectAnswer_NextQuestionIsSameRuleFamilyDifferentTemplate()
        {
            int currentTemplateIndex = 0;
            string[] currentOptions = new[] { "your", "you're", "youre" };
            int seed = 123;

            var followUp = TrialResolver.GetFollowUpPresentation(question, currentTemplateIndex, currentOptions, seed);

            Assert.That(followUp.question.ruleFamily, Is.EqualTo(question.ruleFamily));
            Assert.That(followUp.selectedTemplateIndex, Is.Not.EqualTo(currentTemplateIndex));
        }

        [Test]
        public void AfterIncorrectAnswer_NeverRepeatsIdenticalQuestionConsecutively()
        {
            int currentTemplateIndex = 0;
            string[] currentOptions = new[] { "your", "you're", "youre" };

            for (int seed = 1; seed <= 10; seed++)
            {
                var followUp = TrialResolver.GetFollowUpPresentation(question, currentTemplateIndex, currentOptions, seed);

                bool sameTemplate = followUp.selectedTemplateIndex == currentTemplateIndex;
                bool sameOptions = System.Linq.Enumerable.SequenceEqual(followUp.shuffledOptions, currentOptions);

                Assert.That(sameTemplate && sameOptions, Is.False, $"Follow-up presentation matched current presentation identically on seed {seed}");

                currentTemplateIndex = followUp.selectedTemplateIndex;
                currentOptions = followUp.shuffledOptions;
            }
        }
    }
}
