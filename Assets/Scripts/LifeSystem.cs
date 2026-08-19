using System;
using System.Collections.Generic;
using UnityEngine;

namespace RedInk
{
    public class LifeSystem : MonoBehaviour
    {
        public static readonly FacialFeature[] FixedFeatureOrder = new FacialFeature[]
        {
            FacialFeature.LeftEar,
            FacialFeature.RightEar,
            FacialFeature.LeftEyebrow,
            FacialFeature.RightEyebrow,
            FacialFeature.Nose,
            FacialFeature.LeftEye,
            FacialFeature.RightEye,
            FacialFeature.Mouth
        };

        private int _mistakeCount = 0;
        private bool _isDead = false;

        public event Action<FacialFeature, int> OnFeatureLost;
        public event Action OnDeath;

        public int MistakeCount => _mistakeCount;
        public int RemainingLives => FixedFeatureOrder.Length - _mistakeCount;
        public bool IsDead => _isDead;

        public void ResetSystem()
        {
            _mistakeCount = 0;
            _isDead = false;
        }

        public FacialFeature? RemoveNextFeature()
        {
            if (_isDead || _mistakeCount >= FixedFeatureOrder.Length)
            {
                return null;
            }

            var lostFeature = FixedFeatureOrder[_mistakeCount];
            _mistakeCount++;

            OnFeatureLost?.Invoke(lostFeature, _mistakeCount - 1);

            if (_mistakeCount == FixedFeatureOrder.Length)
            {
                _isDead = true;
                OnDeath?.Invoke();
            }

            return lostFeature;
        }

        public void RegisterCorrectAnswer()
        {
            // Correct answer leaves feature state unchanged
        }

        public List<FacialFeature> GetLostFeatures()
        {
            var list = new List<FacialFeature>();
            for (int i = 0; i < _mistakeCount; i++)
            {
                list.Add(FixedFeatureOrder[i]);
            }
            return list;
        }
    }
}
