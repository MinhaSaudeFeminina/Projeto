<?php

namespace App\Http\Controllers\Api\V1\Mobile;

use App\Http\Controllers\Controller;
use App\Http\Requests\Mobile\StoreSymptomRecordRequest;
use App\Models\SymptomRecord;
use App\Services\Health\HealthAlertGuidanceService;
use Illuminate\Http\Request;

class SymptomRecordController extends Controller
{
    public function index(Request $request)
    {
        return response()->json([
            'data' => SymptomRecord::query()
                ->with('symptom')
                ->where('user_id', $request->user()->id)
                ->latest('occurred_on')
                ->get(),
        ]);
    }

    public function store(StoreSymptomRecordRequest $request, HealthAlertGuidanceService $guidance)
    {
        $record = new SymptomRecord([
            ...$request->validated(),
            'user_id' => $request->user()->id,
        ]);
        $record->alert_shown = $guidance->shouldShowAlert($record->load('symptom'));
        $record->save();

        return response()->json([
            'data' => $record->load('symptom'),
            'guidance' => $record->alert_shown ? $guidance->guidance() : null,
        ], 201);
    }
}
