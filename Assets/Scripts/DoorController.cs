using System;
using UnityEngine;

namespace RedInk
{
    public class DoorController : MonoBehaviour
    {
        public bool IsLocked { get; private set; } = true;
        public bool IsIsOpen { get; private set; } = false;

        public event Action OnDoorUnlocked;

        public void ResetDoor()
        {
            IsLocked = true;
            IsIsOpen = false;
        }

        public void HandleTrialOutcome(TrialOutcome outcome)
        {
            if (outcome == TrialOutcome.Correct)
            {
                UnlockAndOpen();
            }
            else
            {
                Reject();
            }
        }

        public void UnlockAndOpen()
        {
            IsLocked = false;
            IsIsOpen = true;
            OnDoorUnlocked?.Invoke();

            if (ChimeConductor.Instance != null)
            {
                ChimeConductor.Instance.PlaySuccessChime();
            }
        }

        public void Reject()
        {
            IsLocked = true;
            IsIsOpen = false;

            if (ChimeConductor.Instance != null)
            {
                ChimeConductor.Instance.PlayFailureChime();
            }
        }
    }
}
