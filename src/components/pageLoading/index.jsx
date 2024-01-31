import Fade from 'react-reveal/Fade';

const messages = [
  'Balancing chakras and aligning energies...',
  'Harmonizing mind waves with the cosmos...',
  'Inhaling tranquility, exhaling stress...',
  'Channeling inner peace from the Zen garden...',
  'Connecting with the serenity of a still pond...',
  'Finding stillness in the dance of the breath...',
  'Absorbing calmness like a sponge in a sea of mindfulness...',
  'Synchronizing heartbeats with the rhythm of the universe...',
  'Navigating the labyrinth of peaceful thoughts...',
  'Cultivating patience in the garden of the present moment...',
  'Letting go of worries, one exhale at a time...',
  'Elevating the spirit with the gentle breeze of serenity...',
  'Meditating on the sound of silence...',
  'Dissolving stress with the alchemy of mindfulness...',
  'Awakening the inner sage through deep contemplation...',
  'Absorbing tranquility from the lotus of stillness...',
  'Aligning breath with the cosmic rhythm...',
  'Transcending loading times through mindful presence...',
  'Sailing the river of serenity, one pixel at a time...',
  'Weaving a tapestry of calm in the fabric of waiting...',
  'Diving into the ocean of inner stillness...',
  'Letting the echoes of a peaceful mind resonate...',
  'Cultivating patience in the garden of loading moments...',
  'Blossoming serenity in the fertile soil of patience...',
  'Merging with the eternal flow of loading zen...',
  'Syncing with the cosmic breath, exhale by loading exhale...',
  'Dancing with the loading bar in the ballroom of tranquility...',
  'Unveiling the art of serenity brushstroke by loading brushstroke...',
  'Harvesting calmness from the fields of waiting...',
  'Sipping on the elixir of loading patience...',
  'Finding balance in the yin and yang of loading...',
  'Floating on the clouds of serenity...',
  'Tuning into the frequency of loading calm...',
  'Nurturing the bonsai tree of loading tranquility...',
  'Wandering through the meadows of loading mindfulness...',
  'Contemplating the loading essence of existence...',
  'Radiating peace in the loading spectrum...',
  'Discovering stillness in the loading chaos...',
  'Breathing in positivity, exhaling loading expectations...',
  'Riding the waves of loading serenity...',
  'Chasing fireflies of patience in the loading twilight...',
  'Transmuting loading impatience into calm presence...',
  'Basking in the loading glow of inner peace...',
  'Weaving loading mantras into the fabric of time...',
  'Finding bliss in the loading embrace of tranquility...',
  'Savoring the flavor of loading Zen tea...',
  'Dancing with loading shadows, embracing the light of serenity...',
];

export const PageLoading = () => {
  const message = messages[Math.floor(Math.random() * messages.length)];
  return (
    <main>
      <Fade opposite>
        <div className="full-page-loader">
          <div className="card-loader">
            <h5>Please Wait !!!</h5>
            <p>{message}</p>
            <div className="loader">
              <div className="spin"></div>
              <div className="bounce"></div>
            </div>
          </div>
        </div>
      </Fade>
    </main>
  );
};
