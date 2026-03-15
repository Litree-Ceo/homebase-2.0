/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import clsx from 'clsx';
import HomeButton from './HomeButton';
import { Stars } from './svg';
import UploadImages from './UploadImages';
import { useFormStatus } from 'react-dom';

export default function FormFields({}) {
  const { pending } = useFormStatus();

  return (
    <>
      <HomeButton
        className={clsx(
          'bg-white/10 border-white/20 backdrop-blur-xl',
          pending ? 'text-gray-400' : 'text-foreground',
        )}
      />

      <section className="flex flex-col gap-4 p-5 pt-8 flex-grow">
        <Stars gradient />

        <h1
          className={clsx(
            'font-display text-[32px] leading-[1.125] font-bold bg-clip-text text-transparent gradient',
            pending ? 'pointer-events-none' : '',
          )}
        >
          Dream Your Vacation
        </h1>

        {/* Prompt input field */}
        <textarea
          name="request"
          className="w-full resize-none text-foreground placeholder-gray-500 focus:outline-none min-h-[200px] flex-grow bg-transparent text-xl leading-relaxed"
          placeholder="Describe your perfect trip... (e.g., 'A romantic weekend in Paris with art museums and wine tasting')"
          required
          disabled={pending}
        />
      </section>

      <section className="w-full p-5 grid gap-3 mt-auto">
        {!pending && <UploadImages />}

        {/* CTA */}
        <button
          className="w-full p-4 rounded-xl text-lg text-center font-bold text-white bg-accent hover:brightness-110 transition-all shadow-lg hover:shadow-accent/20"
          type="submit"
          disabled={pending}
        >
          Plan My Dream Trip
        </button>
      </section>
    </>
  );
}
