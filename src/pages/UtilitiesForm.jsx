import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header.jsx';
import { ProgressBar } from '../components/ProgressBar.jsx';
import { PhotoCapture } from '../components/PhotoCapture.jsx';
import { useInspection } from '../context/InspectionContext.jsx';
import { ChevronRight } from 'lucide-react';

export function UtilitiesForm() {
  const navigate = useNavigate();
  const { state, setStep, setUtilities } = useInspection();

  useEffect(() => {
    setStep(4);
  }, [setStep]);

  const handleUtilityChange = (utility, field, value) => {
    setUtilities({
      [utility]: {
        ...state.utilities[utility],
        [field]: value,
      },
    });
  };

  const handleNext = () => {
    setStep(5);
    navigate('/inspection/issues');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <Header
        title="Utilities & Readings"
        onBack={() => navigate('/inspection/rooms')}
      />
      <ProgressBar currentStep={4} />

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Meter Readings */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Meter Readings</h2>

          {/* Gas */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 mb-3">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Gas Meter Reading
            </label>
            <input
              type="text"
              value={state.utilities.gas.reading}
              onChange={(e) => handleUtilityChange('gas', 'reading', e.target.value)}
              placeholder="e.g. 12345.67"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent mb-3"
            />
            <PhotoCapture
              photos={state.utilities.gas.photo ? [state.utilities.gas.photo] : []}
              onChange={(photos) => handleUtilityChange('gas', 'photo', photos[0] || null)}
            />
          </div>

          {/* Electric */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 mb-3">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Electric Meter Reading
            </label>
            <input
              type="text"
              value={state.utilities.electric.reading}
              onChange={(e) => handleUtilityChange('electric', 'reading', e.target.value)}
              placeholder="e.g. 12345.67"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent mb-3"
            />
            <PhotoCapture
              photos={state.utilities.electric.photo ? [state.utilities.electric.photo] : []}
              onChange={(photos) => handleUtilityChange('electric', 'photo', photos[0] || null)}
            />
          </div>

          {/* Water */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 mb-3">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Water Meter Reading
            </label>
            <input
              type="text"
              value={state.utilities.water.reading}
              onChange={(e) => handleUtilityChange('water', 'reading', e.target.value)}
              placeholder="e.g. 12345.67"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent mb-3"
            />
            <PhotoCapture
              photos={state.utilities.water.photo ? [state.utilities.water.photo] : []}
              onChange={(photos) => handleUtilityChange('water', 'photo', photos[0] || null)}
            />
          </div>
        </section>

        {/* Safety Checks */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Safety Checks</h2>

          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 space-y-3">
            {/* Smoke Alarm */}
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <label htmlFor="smokeAlarm" className="font-semibold text-gray-700 flex-1 cursor-pointer">
                Smoke Alarm Tested
              </label>
              <input
                id="smokeAlarm"
                type="checkbox"
                checked={state.utilities.smokeAlarm ?? false}
                onChange={(e) => setUtilities({ smokeAlarm: e.target.checked })}
                className="w-5 h-5 accent-blue-600 cursor-pointer"
              />
            </div>

            {/* CO Alarm */}
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <label htmlFor="coAlarm" className="font-semibold text-gray-700 flex-1 cursor-pointer">
                CO Alarm Tested
              </label>
              <input
                id="coAlarm"
                type="checkbox"
                checked={state.utilities.coAlarm ?? false}
                onChange={(e) => setUtilities({ coAlarm: e.target.checked })}
                className="w-5 h-5 accent-blue-600 cursor-pointer"
              />
            </div>
          </div>
        </section>

        {/* Keys */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Keys & Access</h2>

          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Number of Keys Present
            </label>
            <input
              type="number"
              value={state.utilities.keysPresent}
              onChange={(e) => setUtilities({ keysPresent: e.target.value })}
              placeholder="e.g. 2"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>
        </section>

        {/* Next button */}
        <button
          onClick={handleNext}
          className="w-full bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg flex items-center justify-center gap-2 active:bg-blue-700 transition-colors"
        >
          Next
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
