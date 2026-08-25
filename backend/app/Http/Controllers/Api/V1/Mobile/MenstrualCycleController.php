<?php

namespace App\Http\Controllers\Api\V1\Mobile;

use App\Http\Controllers\Controller;
use App\Http\Requests\Mobile\StoreMenstrualCycleRequest;
use App\Models\MenstrualCycle;
use Illuminate\Http\Request;

class MenstrualCycleController extends Controller
{
    public function index(Request $request)
    {
        return response()->json([
            'data' => MenstrualCycle::query()
                ->where('user_id', $request->user()->id)
                ->latest('start_date')
                ->get(),
        ]);
    }

    public function store(StoreMenstrualCycleRequest $request)
    {
        $cycle = MenstrualCycle::create([
            ...$request->safe()->except('symptom_record_ids'),
            'user_id' => $request->user()->id,
        ]);

        if ($request->filled('symptom_record_ids')) {
            $cycle->symptoms()->sync($request->validated('symptom_record_ids'));
        }

        return response()->json(['data' => $cycle->load('symptoms')], 201);
    }
}
