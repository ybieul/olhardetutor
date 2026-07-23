import { assertEquals } from 'jsr:@std/assert@1';
import { generateTemporaryPassword, inferLocaleAndCountry, isEmailAlreadyRegistered } from './logic.ts';

// These two payloads are the acceptance-criteria fixtures: "simular o
// webhook com payload BR gera conta ... em pt-BR" / "payload US ... em en".

const BR_PAYLOAD = {
  event: 'SALE_APPROVED',
  sale_id: 'sale_br_001',
  customer: { name: 'Maria Silva', email: 'maria@exemplo.com.br', phone_number: '+5511999999999' },
};

const US_PAYLOAD = {
  event: 'SALE_APPROVED',
  sale_id: 'sale_us_001',
  customer: { name: 'John Smith', email: 'john@example.com', phone_number: '+15551234567' },
};

Deno.test('inferLocaleAndCountry: BR payload (phone DDI) resolves to pt-BR', () => {
  assertEquals(inferLocaleAndCountry(BR_PAYLOAD), { locale: 'pt-BR', country: 'BR' });
});

Deno.test('inferLocaleAndCountry: US payload (phone DDI) resolves to en', () => {
  assertEquals(inferLocaleAndCountry(US_PAYLOAD), { locale: 'en', country: 'US' });
});

Deno.test('inferLocaleAndCountry: explicit customer.country wins over everything else', () => {
  assertEquals(inferLocaleAndCountry({ customer: { email: 'x@example.com', phone_number: '+1555', country: 'br' } }), {
    locale: 'pt-BR',
    country: 'BR',
  });
  assertEquals(inferLocaleAndCountry({ customer: { email: 'x@example.com.br', phone_number: '+55', country: 'ca' } }), {
    locale: 'en',
    country: 'CA',
  });
});

Deno.test('inferLocaleAndCountry: falls back to email TLD when there is no phone/country', () => {
  assertEquals(inferLocaleAndCountry({ customer: { email: 'ana@empresa.com.br' } }), {
    locale: 'pt-BR',
    country: 'BR',
  });
});

Deno.test('inferLocaleAndCountry: falls back to the configurable default when there is no signal at all', () => {
  assertEquals(inferLocaleAndCountry({ customer: { email: 'x@example.com' } }), { locale: 'pt-BR', country: 'BR' });
  assertEquals(
    inferLocaleAndCountry({ customer: { email: 'x@example.com' } }, { defaultLocale: 'en', defaultCountry: 'CA' }),
    { locale: 'en', country: 'CA' },
  );
});

Deno.test('generateTemporaryPassword: produces a sufficiently long, non-empty random string', () => {
  const a = generateTemporaryPassword();
  const b = generateTemporaryPassword();
  assertEquals(a.length > 0, true);
  assertEquals(a === b, false);
});

Deno.test('isEmailAlreadyRegistered: recognizes the email_exists code and the message fallback', () => {
  assertEquals(isEmailAlreadyRegistered({ code: 'email_exists' }), true);
  assertEquals(
    isEmailAlreadyRegistered({ message: 'A user with this email address has already been registered' }),
    true,
  );
  assertEquals(isEmailAlreadyRegistered({ code: 'weak_password' }), false);
  assertEquals(isEmailAlreadyRegistered(null), false);
});
