<?php

it('serves swagger ui documentation page', function () {
    $response = $this->get('/api/documentation');

    $response->assertStatus(200);
});

it('serves swagger json spec', function () {
    $response = $this->get('/docs');

    $response->assertStatus(200)
        ->assertJsonStructure(['openapi', 'info', 'paths']);
});
