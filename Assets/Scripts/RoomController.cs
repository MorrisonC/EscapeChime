using System;
using UnityEngine;

namespace RedInk
{
    public class RoomController : MonoBehaviour
    {
        public DoorController doorController;
        public LifeSystem lifeSystem;

        public RoomPlan CurrentPlan { get; private set; }
        public int AttemptCountInRoom { get; private set; } = 0;

        public event Action<RoomPlan> OnRoomDisplayed;
        public event Action<TrialOutcome, string> OnTrialResolved;

        public void InitializeRoom(RoomPlan plan)
        {
            CurrentPlan = plan;
            AttemptCountInRoom = 0;
            if (doorController != null)
            {
                doorController.ResetDoor();
            }
            OnRoomDisplayed?.Invoke(CurrentPlan);
        }

        public TrialOutcome SubmitAnswer(string chosenOption, int seedForRetry = 42)
        {
            if (CurrentPlan == null) return TrialOutcome.Incorrect;

            AttemptCountInRoom++;
            var outcome = TrialResolver.EvaluateAnswer(CurrentPlan.question, chosenOption);

            if (doorController != null)
            {
                doorController.HandleTrialOutcome(outcome);
            }

            if (outcome == TrialOutcome.Correct)
            {
                if (lifeSystem != null)
                {
                    lifeSystem.RegisterCorrectAnswer();
                }
            }
            else
            {
                if (lifeSystem != null)
                {
                    lifeSystem.RemoveNextFeature();
                }

                if (lifeSystem == null || !lifeSystem.IsDead)
                {
                    var followUpPlan = TrialResolver.GetFollowUpPresentation(
                        CurrentPlan.question,
                        CurrentPlan.selectedTemplateIndex,
                        CurrentPlan.shuffledOptions,
                        seedForRetry + AttemptCountInRoom);

                    CurrentPlan = followUpPlan;
                    OnRoomDisplayed?.Invoke(CurrentPlan);
                }
            }

            OnTrialResolved?.Invoke(outcome, chosenOption);
            return outcome;
        }
    }
}
