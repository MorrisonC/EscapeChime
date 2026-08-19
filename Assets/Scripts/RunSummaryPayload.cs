using System;

namespace RedInk
{
    public enum RunState
    {
        NotStarted,
        InProgress,
        Won,
        Dead
    }

    [Serializable]
    public class RunSummaryPayload
    {
        public int seed;
        public int totalRooms;
        public int roomsCleared;
        public int totalAttempts;
        public int correctAnswers;
        public int mistakes;
        public float accuracy;
        public int featuresLost;
        public RunState state;
    }
}
