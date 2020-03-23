// src/app.test.js

import React from 'react';
import App from './app';
import axios from './axioscopy';
import { waitForElement, render } from '@testing-library/react';


// automatic mock --this will make a dumb copy of axios so that we never actually
//make a request to the server
jest.mock('./axioscopy');

test('app renders correctly', async() => {
    axios.get.mockResolvedValue({
        data: {
            id: 1,
            first: 'jack',
            last: 'randol',
            url: '/default.png'
        }
    });

    const { container } = render(<App />);

    await waitForElement(() => container.querySelector ('div'));

    expect(container.innerHTML).toContain("<div>");


    console.log("innerHTML:", container.innerHTML);

});
