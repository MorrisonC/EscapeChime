using System;

namespace RedInk
{
    [Serializable]
    public class RoomPlan
    {
        public int roomIndex;
        public GrammarQuestion question;
        public int selectedTemplateIndex;
        public string selectedTemplate;
        public string[] shuffledOptions;

        public RoomPlan(int roomIndex, GrammarQuestion question, int selectedTemplateIndex, string[] shuffledOptions)
        {
            this.roomIndex = roomIndex;
            this.question = question;
            this.selectedTemplateIndex = selectedTemplateIndex;
            this.selectedTemplate = (question != null && question.sentenceTemplates != null && selectedTemplateIndex < question.sentenceTemplates.Length)
                ? question.sentenceTemplates[selectedTemplateIndex]
                : "";
            this.shuffledOptions = shuffledOptions;
        }
    }
}
