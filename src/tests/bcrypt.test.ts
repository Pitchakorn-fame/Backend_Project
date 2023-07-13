import { compareHash, hashPassword } from "../auth/bcrypt"


describe('test bcrypt', () => {
    test('compareHash 123 and 123', () => {
        const hash = hashPassword('123')
        expect(compareHash('123',hash)).toBe(true)
    })
})






// describe('test sum function', () => {
//     test('adds 1 + 2 to equal 3', () => {
//       expect(_sum.add(1, 2)).toBe(3);
//     });
//   });