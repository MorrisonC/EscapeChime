using System;
using System.Collections.Generic;
using UnityEngine;

namespace RedInk
{
    public class RunStateManager : MonoBehaviour
    {
        public GrammarQuestionBank questionBank;
        public LifeSystem lifeSystem;
        public RoomController roomController;

        public int CurrentSeed { get; private set; }
        public int TotalRooms { get; private set; }
        public int CurrentRoomIndex { get; private set; }
        public RunState State { get; private set; } = RunState.NotStarted;

        public List<RoomPlan> ActiveRunPlan { get; private set; }

        public int TotalAttempts { get; private set; }
        public int CorrectAnswers { get; private set; }
        public int Mistakes { get; private set; }

        public event Action<RunState> OnStateChanged;
        public event Action<RoomPlan> OnRoomAdvanced;

        public void StartRun(GrammarQuestionBank bank, int seed, int roomCount = 10)
        {
            questionBank = bank ?? GrammarQuestionBank.CreateDefaultBank();
            CurrentSeed = seed;
            TotalRooms = roomCount;
            CurrentRoomIndex = 0;
            TotalAttempts = 0;
            CorrectAnswers = 0;
            Mistakes = 0;
            State = RunState.InProgress;

            if (lifeSystem != null)
            {
                lifeSystem.ResetSystem();
                lifeSystem.OnDeath -= HandleDeath;
                lifeSystem.OnDeath += HandleDeath;
            }

            ActiveRunPlan = ProceduralRunGenerator.GenerateRun(questionBank, seed, roomCount);

            if (roomController != null && ActiveRunPlan.Count > 0)
            {
                roomController.InitializeRoom(ActiveRunPlan[0]);
            }

            OnStateChanged?.Invoke(State);
            if (ActiveRunPlan.Count > 0)
            {
                OnRoomAdvanced?.Invoke(ActiveRunPlan[0]);
            }
        }

        public void SubmitAnswer(string chosenOption)
        {
            if (State != RunState.InProgress) return;

            TotalAttempts++;
            if (roomController != null)
            {
                var outcome = roomController.SubmitAnswer(chosenOption, CurrentSeed + TotalAttempts);
                if (outcome == TrialOutcome.Correct)
                {
                    CorrectAnswers++;
                    AdvanceToNextRoomOrWin();
                }
                else
                {
                    Mistakes++;
                }
            }
        }

        public void AdvanceToNextRoomOrWin()
        {
            if (State != RunState.InProgress) return;

            CurrentRoomIndex++;
            if (CurrentRoomIndex >= TotalRooms)
            {
                State = RunState.Won;
                OnStateChanged?.Invoke(State);
            }
            else if (ActiveRunPlan != null && CurrentRoomIndex < ActiveRunPlan.Count)
            {
                var nextRoom = ActiveRunPlan[CurrentRoomIndex];
                if (roomController != null)
                {
                    roomController.InitializeRoom(nextRoom);
                }
                OnRoomAdvanced?.Invoke(nextRoom);
            }
        }

        private void HandleDeath()
        {
            State = RunState.Dead;
            OnStateChanged?.Invoke(State);
        }

        public RunSummaryPayload GetSummary()
        {
            int lostCount = lifeSystem != null ? lifeSystem.MistakeCount : Mistakes;
            float acc = TotalAttempts > 0 ? (float)CorrectAnswers / TotalAttempts : 0f;

            return new RunSummaryPayload
            {
                seed = CurrentSeed,
                totalRooms = TotalRooms,
                roomsCleared = CurrentRoomIndex,
                totalAttempts = TotalAttempts,
                correctAnswers = CorrectAnswers,
                mistakes = Mistakes,
                accuracy = acc,
                featuresLost = lostCount,
                state = State
            };
        }
    }
}
